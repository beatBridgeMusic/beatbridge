/// src/features/transitions/components/SongSelector.tsx
import React, { useState, useEffect, useMemo } from 'react';
import type { DbSong } from '../types';
import { MAX_SONG_SELECTION, MIN_SONG_SELECTION } from '../constants';

import { useAuth } from '../../../AuthContext';

type PlaylistSummary = {
  id: string;
  name: string;
  created_at?: string | null;
  updated_at?: string | null;
  track_count?: number | null;
};

interface SongSelectorProps {
  selectedSongs: DbSong[];
  onSongsChange: (songs: DbSong[]) => void;
}

export const SongSelector: React.FC<SongSelectorProps> = ({
  selectedSongs,
  onSongsChange,
}) => {
  const [availableSongs, setAvailableSongs] = useState<DbSong[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchFilter, setSearchFilter] = useState('');
  const [sortBy, setSortBy] = useState<'artist' | 'title'>('artist');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { user, token } = useAuth();

  // Playlist dropdown state
  const [playlists, setPlaylists] = useState<PlaylistSummary[]>([]);
  const [selectedId, setSelectedId] = useState('');
  const [dropdownStatus, setDropdownStatus] = useState<
    'idle' | 'loading' | 'ready' | 'empty' | 'error'
  >('idle');
  const [dropdownError, setDropdownError] = useState('');

  // Sort playlists by most recent
  const sortedPlaylists = useMemo(() => {
    return [...playlists].sort((a, b) => {
      const at = Date.parse(a.updated_at || a.created_at || '') || 0;
      const bt = Date.parse(b.updated_at || b.created_at || '') || 0;
      return bt - at;
    });
  }, [playlists]);

  // Fetch playlists
  useEffect(() => {
    let cancelled = false;

    const fetchPlaylists = async () => {
      if (!user?.id) return;

      setDropdownStatus('loading');
      setDropdownError('');
      try {
        const resp = await fetch(
          `http://localhost:3001/songs/playlists/${user.id}`,
          {
            headers: {
              'Content-Type': 'application/json',
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
          }
        );

        if (!resp.ok) {
          let msg = `HTTP ${resp.status}`;
          try {
            const j = await resp.json();
            if (j?.error) msg = j.error;
          } catch {
            throw new Error(msg);
          }
        }

        const data = await resp.json();
        const list = Array.isArray(data) ? data : data.playlists;

        if (cancelled) return;

        setPlaylists(list || []);

        if (!list || list.length === 0) {
          setSelectedId('');
          setDropdownStatus('empty');
          return;
        }

        // Auto-select most recent playlist if no selectedId
        if (!selectedId) {
          const mostRecentId = [...list].sort((a, b) => {
            const at = Date.parse(a.updated_at || a.created_at || '') || 0;
            const bt = Date.parse(b.updated_at || b.created_at || '') || 0;
            return bt - at;
          })[0].id;
          setSelectedId(mostRecentId);
        }

        setDropdownStatus('ready');
      } catch (error) {
        if (cancelled) return;
        setDropdownError(
          error instanceof Error ? error.message : 'Failed to load playlists'
        );
        setDropdownStatus('error');
      }
    };

    fetchPlaylists();
    return () => {
      cancelled = true;
    };
  }, [user?.id, token, selectedId]);

  // Fetch songs when playlist selection changes
  useEffect(() => {
    const fetchSongs = async () => {
      setIsLoading(true);
      try {
        if (!selectedId) {
          setAvailableSongs([]);
          return;
        }

        const response = await fetch(
          `http://localhost:3001/songs/playlistTracks/${selectedId}`,
          {
            headers: {
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
          }
        );

        if (!response.ok) {
          throw new Error(
            `Error fetching playlist songs, server returned ${response.status}`
          );
        }
        const data = await response.json();

        setAvailableSongs(data);
      } catch (error) {
        console.error('Failed to fetch songs:', error);
        setAvailableSongs([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSongs();
  }, [selectedId, token]);

  // Filter and sort songs
  const filteredAndSortedSongs = useMemo(() => {
    // If no songs are available yet, return empty array
    if (!availableSongs?.length) return [];

    return availableSongs
      .filter((song) => {
        // Guard against undefined properties
        const trackName = song.track_name?.toLowerCase() ?? '';
        const artistName = song.artist_name_s?.toLowerCase() ?? '';
        const searchTerm = searchFilter.toLowerCase();

        return (
          trackName.includes(searchTerm) || artistName.includes(searchTerm)
        );
      })
      .sort((a, b) => {
        if (sortBy === 'artist') {
          // Use nullish coalescing to provide fallback values
          const artistA = a.artist_name_s ?? '';
          const artistB = b.artist_name_s ?? '';
          return artistA.localeCompare(artistB);
        }
        // Use nullish coalescing to provide fallback values
        const titleA = a.track_name ?? '';
        const titleB = b.track_name ?? '';
        return titleA.localeCompare(titleB);
      });
  }, [availableSongs, searchFilter, sortBy]);

  const handleSongToggle = (song: DbSong) => {
    selectedSongs.map((s) => ({ uri: s.track_uri, name: s.track_name }));

    const isSelected = selectedSongs.some(
      (s) => s.track_uri === song.track_uri
    );

    if (isSelected) {
      // Remove song
      onSongsChange(
        selectedSongs.filter((s) => s.track_uri !== song.track_uri)
      );
    } else {
      // Add song (if under limit)
      if (selectedSongs.length < MAX_SONG_SELECTION) {
        onSongsChange([...selectedSongs, song]);
      }
    }
  };

  const handleRemoveSelectedSong = (trackUri: string) => {
    onSongsChange(selectedSongs.filter((s) => s.track_uri !== trackUri));
  };

  const formatDuration = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (isLoading) {
    return <div className='song-selector loading'>Loading songs...</div>;
  }

  return (
    <div className='song-selector'>
      <div className='w-full max-w-3xl mx-auto px-4 py-6'>
        <div className='mb-4'>
          <label className='block mb-2 text-sm text-white'>
            Select a playlist
          </label>

          <div className='flex items-center gap-2'>
            <select
              value={selectedId}
              onChange={(e) => {
                const id = e.target.value;
                // console.log('e.target', e.target);
                setSelectedId(id);
                // const selectedPlaylist = sortedPlaylists.find((p) => p.id === id);
                // if (selectedPlaylist) {
                //   console.log('Selected playlist:', selectedPlaylist);
                // }
              }}
              disabled={
                dropdownStatus === 'loading' ||
                dropdownStatus === 'empty' ||
                dropdownStatus === 'error'
              }
              className='w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white disabled:opacity-50'
            >
              {dropdownStatus === 'loading' && (
                <option value=''>Loading your playlists…</option>
              )}
              {dropdownStatus === 'empty' && (
                <option value=''>
                  No playlists yet — upload a CSV to begin
                </option>
              )}
              {dropdownStatus === 'error' && (
                <option value=''>Couldn't load playlists</option>
              )}
              {dropdownStatus === 'ready' &&
                sortedPlaylists.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                    {typeof p.track_count === 'number'
                      ? ` (${p.track_count} tracks)`
                      : ''}
                  </option>
                ))}
            </select>

            {dropdownStatus === 'loading' && (
              <span className='text-xs text-white/70'>Loading…</span>
            )}
            {dropdownStatus === 'error' && (
              <span className='text-xs text-red-300'>Error</span>
            )}
          </div>

          {dropdownError && (
            <p className='mt-2 text-xs text-red-300'>{dropdownError}</p>
          )}
        </div>

        {selectedId ? (
          <p className='text-white'>
            Selected:{' '}
            <span className='font-medium'>
              {sortedPlaylists.find((p) => p.id === selectedId)?.name}
            </span>
          </p>
        ) : (
          <p className='text-white/70'>Pick a playlist to continue.</p>
        )}
      </div>
      {/* ✅ REMOVED: <h3>Choose Your Songs</h3> - now handled by step card header */}
      {/* 🟢 CHANGED: Added step-description class, removed duplicate heading */}
      <p className='step-description'>
        Select {MIN_SONG_SELECTION}-{MAX_SONG_SELECTION} songs from your
        playlist
      </p>

      {/* Selected Songs Display */}
      {selectedSongs.length > 0 && (
        <div className='selected-songs'>
          <h4>
            Selected Songs ({selectedSongs.length}/{MAX_SONG_SELECTION})
          </h4>
          <div className='selected-songs-list'>
            {selectedSongs.map((song) => (
              <div key={song.track_uri} className='selected-song-chip'>
                <span className='song-info'>
                  {song.track_name} - {song.artist_name_s}
                </span>
                <button
                  onClick={() => handleRemoveSelectedSong(song.track_uri)}
                  className='remove-song-btn'
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Song Selection Dropdown */}
      <div className='song-dropdown'>
        <button
          className='dropdown-toggle'
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        >
          Add Songs ({filteredAndSortedSongs.length} available)
          <span className={`arrow ${isDropdownOpen ? 'up' : 'down'}`}>▼</span>
        </button>

        {isDropdownOpen && (
          <div className='dropdown-content'>
            {/* Search and Sort Controls */}
            <div className='dropdown-controls'>
              <input
                type='text'
                placeholder='Search songs or artists...'
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className='search-input'
              />
              <select
                value={sortBy}
                onChange={(e) =>
                  setSortBy(e.target.value as 'artist' | 'title')
                }
                className='sort-select'
              >
                <option value='artist'>Sort by Artist</option>
                <option value='title'>Sort by Song Title</option>
              </select>
            </div>

            {/* Songs List */}
            <div className='songs-list'>
              {filteredAndSortedSongs.map((song) => {
                const isSelected = selectedSongs.some(
                  (s) => s.track_uri === song.track_uri
                );
                const isDisabled =
                  !isSelected && selectedSongs.length >= MAX_SONG_SELECTION;

                return (
                  <div
                    key={song.track_uri}
                    className={`song-item ${isSelected ? 'selected' : ''} ${
                      isDisabled ? 'disabled' : ''
                    }`}
                  >
                    <label className='song-checkbox flex items-center gap-3 py-3 cursor-pointer hover:bg-white/5 rounded-md transition'>
                      <input
                        type='checkbox'
                        checked={isSelected}
                        onChange={() => handleSongToggle(song)}
                        disabled={isDisabled}
                        className='w-5 h-5 accent-blue-500 cursor-pointer shrink-0 mt-[2px]'
                      />
                      <div className='song-details'>
                        <div className='song-title'>{song.track_name}</div>
                        <div className='song-artist'>{song.artist_name_s}</div>
                        <div className='song-meta'>
                          {formatDuration(song.duration_ms)} • {song.genres}
                        </div>
                      </div>
                    </label>
                  </div>
                );
              })}

              {filteredAndSortedSongs.length === 0 && (
                <div className='no-results'>
                  No songs found matching your search
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ✅ REMOVED: Redundant selection status - TransitionLab handles this via conditional steps */}
    </div>
  );
};
