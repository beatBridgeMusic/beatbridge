import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import { parse } from 'csv-parse';
import { Client } from 'pg';

// run <node scripts/upsert_csv_to_postgres.js scripts/[file_to_be_uploaded].csv> in the root directory to process the CSV
// make sure the format of the DATABASE_URL in .env is: DATABASE_URL=postgresql://postgres:....supabase.co:5432/postgres?sslmode=require

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// robust .env load
for (const p of [
  path.resolve(__dirname, '../.env'),
  path.resolve(__dirname, '.env'),
  path.resolve(process.cwd(), '.env'),
]) {
  if (fs.existsSync(p)) {
    dotenv.config({ path: p });
    break;
  }
}

function getPgConfig() {
  // Prefer explicit fields (avoid URL parsing quirks in some pg setups)
  const hostFromUrl = process.env.DATABASE_URL?.match(/@([^:/]+):?\d*\//)?.[1];
  const passFromUrl =
    process.env.DATABASE_URL?.match(/postgres:\/\/[^:]+:([^@]+)@/)?.[1] ||
    process.env.DATABASE_URL?.match(/postgresql:\/\/[^:]+:([^@]+)@/)?.[1];

  const host = process.env.PGHOST || hostFromUrl || 'localhost';

  const base = {
    host,
    port: Number(process.env.PGPORT || 5432),
    user: process.env.PGUSER || 'postgres',
    password: process.env.PGPASSWORD || passFromUrl || '',
    database: process.env.PGDATABASE || 'postgres',
  };

  const isSupabase = /\.supabase\.co$/i.test(host);
  const wantSsl =
    isSupabase ||
    /sslmode=require/i.test(process.env.DATABASE_URL || '') ||
    /^(require|no-verify)$/i.test(process.env.PGSSL || process.env.PGSSLMODE || '');

  return wantSsl ? { ...base, ssl: { require: true, rejectUnauthorized: false } } : base;
}

function sanitizeIdentifier(name) {
  // snake_case, letters/digits/underscore only; ensure starts with a letter
  const snake = name
    .trim()
    .toLowerCase()
    .replace(/\.[^.]+$/, '') // drop extension if passed
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
  return /^[a-z]/.test(snake) ? snake : `t_${snake}`;
}

function makeUnique(names) {
  // Ensure unique column names if sanitizing created collisions
  const seen = new Map();
  return names.map((n) => {
    let name = n;
    let i = 1;
    while (seen.has(name)) {
      i += 1;
      name = `${n}_${i}`;
    }
    seen.set(name, true);
    return name;
  });
}

const BOOL_TRUTHY = new Set(['true', 't', '1', 'yes', 'y']);
const BOOL_FALSEY = new Set(['false', 'f', '0', 'no', 'n']);

function inferType(values) {
  // values: array of strings (possibly empty). Empty => nullable.
  // Simple type inference: INTEGER, DOUBLE PRECISION, BOOLEAN, TIMESTAMPTZ, TEXT
  let allEmpty = true;
  let allInt = true;
  let allNum = true;
  let allBool = true;
  let allDate = true;

  for (const raw of values) {
    const v = (raw ?? '').trim();
    if (v === '') continue;
    allEmpty = false;

    // Boolean?
    const lower = v.toLowerCase();
    if (!(BOOL_TRUTHY.has(lower) || BOOL_FALSEY.has(lower))) allBool = false;

    // Integer?
    if (!/^[+-]?\d+$/.test(v)) allInt = false;

    // Number?
    if (!/^[+-]?\d+(\.\d+)?$/.test(v)) allNum = false;

    // Date?
    const d = new Date(v);
    if (Number.isNaN(d.getTime())) allDate = false;

    // quick exits
    if (!allInt && !allNum && !allBool && !allDate) break;
  }

  if (allEmpty) return 'TEXT';
  if (allBool) return 'BOOLEAN';
  if (allInt) return 'INTEGER';
  if (allNum) return 'DOUBLE PRECISION';
  if (allDate) return 'TIMESTAMPTZ';
  return 'TEXT';
}

function normalizeValue(type, raw) {
  // Convert CSV string to proper JS value for param binding
  const v = raw == null ? '' : String(raw).trim();
  if (v === '') return null;

  switch (type) {
    case 'BOOLEAN': {
      const lower = v.toLowerCase();
      if (BOOL_TRUTHY.has(lower)) return true;
      if (BOOL_FALSEY.has(lower)) return false;
      return null;
    }
    case 'INTEGER':
      return Number.isNaN(Number.parseInt(v, 10)) ? null : Number.parseInt(v, 10);
    case 'DOUBLE PRECISION':
      return Number.isNaN(Number.parseFloat(v)) ? null : Number.parseFloat(v);
    case 'TIMESTAMPTZ': {
      const d = new Date(v);
      return Number.isNaN(d.getTime()) ? null : d.toISOString();
    }
    default:
      return v;
  }
}

function detectUniqueColumn(sanitizedCols) {
  // Heuristics for a natural key
  const candidates = ['track_id', 'spotify_id', 'id', 'uri', 'song_id'];
  for (const c of candidates) {
    if (sanitizedCols.includes(c)) return c;
  }
  return null;
}

async function readCsv(filePath) {
  const content = fs.createReadStream(filePath);
  return new Promise((resolve, reject) => {
    const rows = [];
    const parser = parse({
      columns: true,
      skip_empty_lines: true,
      bom: true,
      relax_quotes: true,
      relax_column_count: true,
      trim: true,
    });
    parser.on('readable', () => {
      let record;
      while ((record = parser.read()) !== null) {
        rows.push(record);
      }
    });
    parser.on('error', reject);
    parser.on('end', () => {
      resolve(rows);
    });
    content.pipe(parser);
  });
}

function buildCreateTableSQL({ schema, table, columns, types, uniqueCol, includeRowHash }) {
  const colsSql = [];
  colsSql.push(`id BIGSERIAL PRIMARY KEY`);
  for (let i = 0; i < columns.length; i++) {
    colsSql.push(`"${columns[i]}" ${types[i]}`);
  }
  if (includeRowHash) {
    colsSql.push(`row_hash TEXT UNIQUE`);
  }
  const uniqueClause = uniqueCol ? `, UNIQUE ("${uniqueCol}")` : '';
  return `CREATE TABLE IF NOT EXISTS "${schema}"."${table}" (
  ${colsSql.join(',\n  ')}
  ${uniqueClause}
);`;
}

function buildInsertSQL({ schema, table, columns, uniqueCol, includeRowHash }) {
  const colList = columns.map((c) => `"${c}"`);
  const allCols = ['id'].concat(colList); // id is serial; we won't provide a value
  const insertCols = colList.slice(); // omit id
  const paramCols = columns.map((_, i) => `$${i + 1}`);

  if (includeRowHash) {
    insertCols.push(`row_hash`);
    paramCols.push(`$${columns.length + 1}`);
  }

  const insertSQL = `INSERT INTO "${schema}"."${table}" (${insertCols.join(', ')})
VALUES (${paramCols.join(', ')})`;

  if (uniqueCol) {
    // On conflict, update every column except id and the unique col
    const setAssignments = columns.filter((c) => c !== uniqueCol).map((c) => `"${c}" = EXCLUDED."${c}"`);
    return `${insertSQL}
ON CONFLICT ("${uniqueCol}") DO UPDATE SET
  ${setAssignments.join(', ')}`;
  }

  if (includeRowHash) {
    return `${insertSQL}
ON CONFLICT (row_hash) DO NOTHING`;
  }

  // Fallback: no conflict target -> plain insert
  return insertSQL + ';';
}

async function main() {
  const args = process.argv.slice(2);
  if (args.length < 1) {
    console.error(
      'Usage: node upsert_csv_to_postgres.js <path/to/file.csv> [--schema public] [--table my_table] [--unique col1,col2]'
    );
    process.exit(1);
  }

  const filePath = path.resolve(args[0]);
  if (!fs.existsSync(filePath)) {
    console.error(`File not found: ${filePath}`);
    process.exit(1);
  }

  // CLI options
  let schema = 'public';
  let overrideTable = null;
  let uniqueOverride = null;

  for (let i = 1; i < args.length; i++) {
    const a = args[i];
    if (a === '--schema' && args[i + 1]) schema = args[++i];
    else if (a === '--table' && args[i + 1]) overrideTable = args[++i];
    else if (a === '--unique' && args[i + 1]) uniqueOverride = args[++i];
  }

  const rawTableName = overrideTable || sanitizeIdentifier(path.basename(filePath, path.extname(filePath)));
  const table = sanitizeIdentifier(rawTableName);
  schema = sanitizeIdentifier(schema);

  console.log(`→ Reading CSV: ${filePath}`);
  const rows = await readCsv(filePath);
  if (rows.length === 0) {
    console.log('CSV is empty. Nothing to do.');
    return;
  }

  // Original headers
  const headers = Object.keys(rows[0]);
  // Sanitize and ensure uniqueness
  const sanitizedCols = makeUnique(headers.map(sanitizeIdentifier));

  // Build a mapping header -> sanitized
  const colMap = new Map();
  headers.forEach((h, i) => colMap.set(h, sanitizedCols[i]));

  // Gather per-column values to infer types
  const colValues = sanitizedCols.map(() => []);
  for (const row of rows) {
    headers.forEach((h, i) => {
      colValues[i].push(row[h]);
    });
  }
  const inferredTypes = colValues.map(inferType);

  // Detect/override unique column
  let uniqueCol = null;
  if (uniqueOverride) {
    const u = uniqueOverride.split(',')[0].trim(); // support one for now
    if (!sanitizedCols.includes(sanitizeIdentifier(u))) {
      console.warn(`--unique "${u}" not found among columns; ignoring.`);
    } else {
      uniqueCol = sanitizeIdentifier(u);
    }
  }
  if (!uniqueCol) uniqueCol = detectUniqueColumn(sanitizedCols);

  // Decide if we need row_hash
  const includeRowHash = !uniqueCol;

  const client = new Client(getPgConfig());
  console.log('Connecting with config:', {
    hasUrl: !!process.env.DATABASE_URL,
    host: process.env.PGHOST,
    ssl: client?.connectionParameters?.ssl ? 'on' : 'off',
  });

  await client.connect();

  try {
    // Ensure schema
    await client.query(`CREATE SCHEMA IF NOT EXISTS "${schema}";`);

    // Create table if missing
    const createSQL = buildCreateTableSQL({
      schema,
      table,
      columns: sanitizedCols,
      types: inferredTypes,
      uniqueCol,
      includeRowHash,
    });
    await client.query(createSQL);

    // Prepare insert/upsert
    const insertSQL = buildInsertSQL({
      schema,
      table,
      columns: sanitizedCols,
      uniqueCol,
      includeRowHash,
    });

    console.log(`→ Inserting into ${schema}.${table} (${rows.length} rows)...`);
    await client.query('BEGIN');

    for (const row of rows) {
      // Build value array in sanitized order
      const vals = sanitizedCols.map((sc, i) => {
        const originalHeader = headers[i];
        const type = inferredTypes[i];
        return normalizeValue(type, row[originalHeader]);
      });

      if (includeRowHash) {
        // Create a stable hash from the *original* header order and normalized values
        const concat = sanitizedCols.map((_, i) => (vals[i] == null ? '' : String(vals[i]))).join('||');
        const crypto = await import('crypto');
        const rowHash = crypto.createHash('md5').update(concat).digest('hex');
        vals.push(rowHash);
      }

      await client.query(insertSQL, vals);
    }

    await client.query('COMMIT');
    console.log('✓ Done.');
    if (uniqueCol) {
      console.log(`   Upsert key: "${uniqueCol}" (rows updated when conflicts detected).`);
    } else {
      console.log('   No natural unique key found; used row_hash for de-dupe of exact duplicates.');
      console.log('   Tip: Include a column like track_id/uri to enable true upserts on future runs.');
    }
    console.log(`   Table created/updated: "${schema}"."${table}"`);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('✗ Error:', err.message);
    process.exitCode = 1;
  } finally {
    await client.end();
  }
}

main().catch((e) => {
  console.error('Fatal:', e);
  process.exit(1);
});
