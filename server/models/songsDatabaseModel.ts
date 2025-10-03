import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// TODO: enable SSL mode and TLS encryption
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export default {
  query: async (text: string, params?: unknown[]) => {
    // console.log('executed query', text);
    const client = await pool.connect();
    try {
      const result = await client.query(text, params);
      return result;
    } finally {
      client.release();
    }
  },
};