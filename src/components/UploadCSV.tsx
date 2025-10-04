import React, { useState } from 'react';
import Papa from 'papaparse';
import { useAuth } from '../AuthContext'; // provides { user, token }

export default function UploadPlaylist() {
  const { user, token } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [rows, setRows] = useState<Record<string, any>[]>([]);
  const [status, setStatus] = useState<string>('');
  const [playlistName, setPlaylistName] = useState<string>('');

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setFile(file);
    setRows([]);
    setStatus('');
    if (!file) return;

    // Set playlist name to file name (without extension) if no custom name is set
    if (!playlistName && file) {
      const fileName = file.name.replace(/\.csv$/i, '').replace(/_/g, ' ');
      setPlaylistName(fileName);
    }

    Papa.parse(file, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete: (result) => {
        setRows(result.data as any[]);
        setStatus(`Parsed ${result.data.length} rows`);
      },
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

    // TODO: stretch feature: refresh playlist dropdown on CSV upload. not sure whether to do it here or in UploadCSV
    try {
      console.log(user.id);
      console.log(rows);
      // POST to your backend. Backend should:
      // 1) Create a playlist tied to user.id
      // 2) Upsert rows into a GLOBAL tracks catalog (by track_uri or hash)
      // 3) Insert playlist->track mappings preserving order
      const resp = await fetch('http://localhost:3001/songs/upload', {
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
      console.log('resp:', resp);
      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        throw new Error(err.error || `HTTP ${resp.status}`);
      }

      const data = await resp.json();
      setStatus(`Uploaded! Playlist ${data.playlistName} with ${data.rowsInserted} tracks.`);
      // Optionally clear state
      setFile(null);
      setRows([]);
    } catch (e: any) {
      setStatus(`Upload failed: ${e.message ?? e}`);
    }
  }

  return (
    <div className='w-full max-w-2xl mx-auto px-4 pb-6'>
      <div className='bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 shadow-lg'>
        <div className='flex items-center gap-4 mb-4'>
          <div className='bg-blue-500 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold'>
            1
          </div>
          <h2 className='text-xl font-semibold text-white'>Upload a Playlist</h2>
        </div>

        <div className='space-y-4'>
          <label className='block'>
            <span className='block text-sm text-white mb-1'>Playlist name</span>
            <input
              type='text'
              className='w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-white/50'
              placeholder='My Mix'
              value={playlistName}
              onChange={(e) => setPlaylistName(e.target.value)}
            />
          </label>

          <label className='block'>
            <span className='block text-sm text-white mb-1'>CSV file</span>
            <input
              type='file'
              accept='.csv,text/csv'
              onChange={handleFile}
              className='w-full text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-white/10 file:text-white hover:file:bg-white/20'
            />
          </label>

          <div className='flex items-center gap-2 text-sm'>{status || 'No file selected'}</div>

          <div className='flex gap-4 pt-2'>
            <button
              className='px-6 py-3 rounded-lg bg-white/10 border border-white/20 text-white hover:bg-white/20 active:scale-[0.99] transition-all'
              onClick={() => {
                setFile(null);
                setRows([]);
                setStatus('');
                setPlaylistName('');
              }}
            >
              Reset
            </button>
            <button
              className='ml-auto px-6 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:opacity-90 active:scale-[0.99] disabled:opacity-50 transition-all font-semibold'
              onClick={submitUpload}
              disabled={!user || rows.length === 0}
            >
              Save to Database
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
