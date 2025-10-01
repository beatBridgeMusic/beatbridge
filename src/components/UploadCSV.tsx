import React, { useMemo, useState } from 'react';
import Papa from 'papaparse';
import { useAuth } from '../AuthContext'; // provides { user, token }

// Tiny helper: map common Exportify column names to our canonical fields
function normalizeRow(raw: Record<string, any>) {
  // Tolerate Title/Track, Artist Name/Artist, etc.
  const title = raw.title ?? raw.Title ?? raw.track_name ?? raw.Track ?? null;
  const artist = raw.artist ?? raw.Artist ?? raw.artist_name ?? null;
  const album = raw.album ?? raw.Album ?? raw.album_name ?? null;
  const duration_ms = raw.duration_ms ?? raw.Duration_ms ?? raw.duration ?? null;
  const track_uri = raw.track_uri ?? raw.Uri ?? raw.uri ?? raw.spotify_uri ?? null;
  // Audio features (optional; pass through if present)
  const danceability = raw.danceability ?? null;
  const energy = raw.energy ?? null;
  const valence = raw.valence ?? null;
  const tempo = raw.tempo ?? null;
  const loudness = raw.loudness ?? null;
  const key = raw.key ?? null;
  const mode = raw.mode ?? null;
  const speechiness = raw.speechiness ?? null;
  const acousticness = raw.acousticness ?? null;
  const instrumentalness = raw.instrumentalness ?? null;
  const liveness = raw.liveness ?? null;
  const time_signature = raw.time_signature ?? null;

  return {
    title,
    artist,
    album,
    duration_ms,
    track_uri,
    danceability,
    energy,
    valence,
    tempo,
    loudness,
    key,
    mode,
    speechiness,
    acousticness,
    instrumentalness,
    liveness,
    time_signature,
    // Keep the original row for audit/debug on the server
    _raw: raw,
  };
}

export default function UploadPlaylist() {
  const { user, token } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [rows, setRows] = useState<Record<string, any>[]>([]);
  const [status, setStatus] = useState<string>('');
  const [playlistName, setPlaylistName] = useState<string>('');

  const preview = useMemo(() => rows.slice(0, 5), [rows]);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    setFile(f);
    setRows([]);
    setStatus('');
    if (!f) return;

    Papa.parse(f, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete: (result) => {
        const normalized = (result.data as Record<string, any>[]).filter(Boolean).map(normalizeRow);
        setRows(normalized);
        setStatus(`Parsed ${normalized.length} rows`);
      },
      error: (err) => setStatus(`Parse error: ${String(err)}`),
    });
  };

  async function submitUpload() {
    if (!user) {
      setStatus('Please log in first.');
      return;
    }
    if (!rows.length) {
      setStatus('No rows to upload.');
      return;
    }

    setStatus('Uploading…');

    try {
        console.log(user.id)
        console.log(rows)
      // POST to your backend. Backend should:
      // 1) Create a playlist tied to user.id
      // 2) Upsert rows into a GLOBAL tracks catalog (by track_uri or hash)
      // 3) Insert playlist->track mappings preserving order
      const resp = await fetch('/api/playlists/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // If your backend expects the app token, include it:
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          playlistName: playlistName || (file ? file.name.replace(/\.csv$/i, '') : 'Untitled Upload'),
          rows,
          // IMPORTANT: Use your app user id; backend will trust token and ignore this if it verifies JWT itself.
          userId: user.id,
        }),
      });

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        throw new Error(err.error || `HTTP ${resp.status}`);
      }

      const data = await resp.json();
      setStatus(`Uploaded! Playlist ${data.playlistId} with ${data.rowsInserted} rows.`);
      // Optionally clear state
      setFile(null);
      setRows([]);
    } catch (e: any) {
      setStatus(`Upload failed: ${e.message ?? e}`);
    }
  }

  return (
    <div className='w-full max-w-2xl mx-auto p-4'>
      <div className='bg-white/70 backdrop-blur rounded-2xl shadow p-4 border'>
        <h2 className='text-xl font-semibold mb-3'>Upload Playlist CSV</h2>

        <div className='grid gap-3'>
          <label className='block'>
            <span className='block text-sm text-gray-700 mb-1'>Playlist name (optional)</span>
            <input
              type='text'
              className='w-full border rounded-lg px-3 py-2'
              placeholder='My Groovin’ Mix'
              value={playlistName}
              onChange={(e) => setPlaylistName(e.target.value)}
            />
          </label>

          <label className='block'>
            <span className='block text-sm text-gray-700 mb-1'>CSV file</span>
            <input type='file' accept='.csv,text/csv' onChange={handleFile} className='w-full' />
          </label>

          <div className='flex items-center gap-2 text-sm'>
            <span className='px-2 py-1 rounded bg-gray-100 border'>{status || 'No file selected'}</span>
            {user ? (
              <span className='text-gray-600'>
                Logged in as <strong>{user.email}</strong>
              </span>
            ) : (
              <span className='text-red-600'>Not logged in</span>
            )}
          </div>

          {preview.length > 0 && (
            <div className='mt-2'>
              <div className='text-sm text-gray-700 mb-1'>Preview (first 5 rows)</div>
              <div className='overflow-auto border rounded-lg'>
                <table className='min-w-full text-sm'>
                  <thead className='bg-gray-50'>
                    <tr>
                      <th className='px-2 py-1 text-left'>#</th>
                      <th className='px-2 py-1 text-left'>Title</th>
                      <th className='px-2 py-1 text-left'>Artist</th>
                      <th className='px-2 py-1 text-left'>URI</th>
                      <th className='px-2 py-1 text-left'>Dance</th>
                      <th className='px-2 py-1 text-left'>Tempo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {preview.map((r, i) => (
                      <tr key={i} className='odd:bg-white even:bg-gray-50'>
                        <td className='px-2 py-1'>{i + 1}</td>
                        <td className='px-2 py-1'>{r.title ?? '—'}</td>
                        <td className='px-2 py-1'>{r.artist ?? '—'}</td>
                        <td className='px-2 py-1 truncate max-w-[12rem]' title={r.track_uri ?? ''}>
                          {r.track_uri ?? '—'}
                        </td>
                        <td className='px-2 py-1'>{r.danceability ?? ''}</td>
                        <td className='px-2 py-1'>{r.tempo ?? ''}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className='flex gap-2 pt-2'>
            <button
              className='px-4 py-2 rounded-lg bg-gray-100 border hover:bg-gray-200 active:scale-[0.99]'
              onClick={() => {
                setFile(null);
                setRows([]);
                setStatus('');
              }}
            >
              Reset
            </button>
            <button
              className='ml-auto px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 active:scale-[0.99] disabled:opacity-50'
              onClick={submitUpload}
              disabled={!user || rows.length === 0}
            >
              Save to Database
            </button>
          </div>
        </div>
      </div>

      {/* Guidance panel */}
      <div className='mt-4 text-sm text-gray-600'>
        <p className='mb-1'>This will:</p>
        <ol className='list-decimal ml-6 space-y-1'>
          <li>
            Create a playlist tied to <code>user.id</code> from your AuthContext.
          </li>
          <li>
            Upsert songs into a <em>global</em> <code>tracks</code> catalog using <code>track_uri</code> (or backend
            hash fallback).
          </li>
          <li>Insert playlist → track mappings in order.</li>
        </ol>
      </div>
    </div>
  );
}

// import Papa from 'papaparse';
// import { useState } from 'react';

// export default function UploadCSV() {
//   const [rows, setRows] = useState<any[]>([]);

//   return (
//     <div>
//       <input
//         type='file'
//         accept='.csv,text/csv'
//         onChange={(e) => {
//           const file = e.target.files?.[0];
//           if (!file) return;
//           Papa.parse(file, {
//             header: true, // uses first row as column names
//             dynamicTyping: true,
//             skipEmptyLines: true,
//             complete: (result) => {
//               console.log('Parsed:', result.data.slice(0, 2));
//               setRows(result.data as any[]);
//             },
//           });
//         }}
//       />
//       <pre>{JSON.stringify(rows.slice(0, 2), null, 2)}</pre>
//     </div>
//   );
// }
