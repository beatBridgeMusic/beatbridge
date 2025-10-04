import React, { useEffect, useMemo, useState } from 'react';

type PlaylistSummary = {
  id: string;
  name: string;
  created_at?: string | null;
  updated_at?: string | null;
  track_count?: number | null;
};

type Props = {
  className?: string;
  /** Called after auto-select and whenever the user changes the selection */
  onSelect?: (playlist: PlaylistSummary | null) => void;
  /** If provided and found in the list, this overrides auto-select-most-recent */
  initialPlaylistId?: string;
  userId: string | null;
  /** Optional auth token if your backend expects it (omit if not needed) */
  token?: string | null;
};

// TODO: selecting playlist B after already including songs from playlist A should reset checkboxes and allow you to reselect probably
export default function PlaylistDropdown({ className, onSelect, initialPlaylistId, userId, token }: Props) {
  const [playlists, setPlaylists] = useState<PlaylistSummary[]>([]);
  const [selectedId, setSelectedId] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'ready' | 'empty' | 'error'>('idle');
  const [error, setError] = useState('');

  // Sort by most recent (updated_at, then created_at) descending
  const sorted = useMemo(() => {
    return [...playlists].sort((a, b) => {
      const at = Date.parse(a.updated_at || a.created_at || '') || 0;
      const bt = Date.parse(b.updated_at || b.created_at || '') || 0;
      return bt - at;
    });
  }, [playlists]);

  // Fetch user's playlists exactly once on mount
  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      setStatus('loading');
      setError('');
      try {
        const resp = await fetch(`http://localhost:3001/songs/playlists/${userId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });

        console.log('resp in dropdown:', resp);
        if (!resp.ok) {
          console.log('response not ok');
          // try to parse server error message, but stay resilient
          let msg = `HTTP ${resp.status}`;
          try {
            const j = await resp.json();
            if (j?.error) msg = j.error;
          } catch {
            throw new Error(msg);
          }
        }

        const data = (await resp.json()) as { playlists: PlaylistSummary[] } | PlaylistSummary[];

        // Support either `{ playlists: [...] }` or bare `[...]`
        const list = Array.isArray(data) ? data : data.playlists;
        console.log('data list:', list);

        if (cancelled) return;

        setPlaylists(list || []);

        if (!list || list.length === 0) {
          setSelectedId('');
          setStatus('empty');
          //   onSelect?.(null);
          return;
        }

        // Pick initial selection:
        // 1) use initialPlaylistId if present and found,
        // 2) otherwise auto-select most recent.
        const provided = initialPlaylistId && list.some((p) => p.id === initialPlaylistId);
        const chosenId = provided
          ? (initialPlaylistId as string)
          : [...list].sort((a, b) => {
              const at = Date.parse(a.updated_at || a.created_at || '') || 0;
              const bt = Date.parse(b.updated_at || b.created_at || '') || 0;
              return bt - at;
            })[0].id;

        setSelectedId(chosenId);
        const chosen = list.find((p) => p.id === chosenId) ?? null;
        // onSelect?.(chosen);
        setStatus('ready');
      } catch (e: any) {
        if (cancelled) return;
        setError(e?.message ?? 'Failed to load playlists');
        setStatus('error');
        // onSelect?.(null);
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [token, initialPlaylistId, userId]);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    setSelectedId(id);
    const p = sorted.find((pl) => pl.id === id) ?? null;
    onSelect?.(p);
    console.log('handle change. selectedId:', id, 'p:', p);
  };

  return (
    <div className={className}>
      <label className='block mb-2 text-sm text-white'>Select a playlist</label>

      <div className='flex items-center gap-2'>
        <select
          value={selectedId}
          onChange={handleChange}
          disabled={status === 'loading' || status === 'empty' || status === 'error'}
          className='w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white disabled:opacity-50'
        >
          {status === 'loading' && <option value=''>Loading your playlists…</option>}
          {status === 'empty' && <option value=''>No playlists yet — upload a CSV to begin</option>}
          {status === 'error' && <option value=''>Couldn’t load playlists</option>}
          {status === 'ready' &&
            sorted.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
                {typeof p.track_count === 'number' ? ` (${p.track_count} tracks)` : ''}
              </option>
            ))}
        </select>

        {status === 'loading' && <span className='text-xs text-white/70'>Loading…</span>}
        {status === 'error' && <span className='text-xs text-red-300'>Error</span>}
      </div>

      {error && <p className='mt-2 text-xs text-red-300'>{error}</p>}
    </div>
  );
}
