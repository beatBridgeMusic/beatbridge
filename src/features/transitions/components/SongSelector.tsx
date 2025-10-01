/// src/features/transitions/components/SongSelector.tsx
import React, { useState, useEffect } from 'react';
import type { DbSong } from '../types';
import { MAX_SONG_SELECTION, MIN_SONG_SELECTION } from '../constants';

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

  // Mock data - will be replaced with API call
  useEffect(() => {
    const fetchSongs = async () => {
      setIsLoading(true);
      try {
        // TODO: Replace with better API call? or maybe it's too much work to refactor the frontend
        const response = await fetch('http://localhost:3001/songs/all');
        if (!response.ok) {
          throw new Error(
            `Error fetching all songs, server returned ${response.status}`
          );
        }
        const data = await response.json();

        setAvailableSongs(data);
      } catch (error) {
        console.error('Failed to fetch songs:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSongs();
  }, []);

  // Filter and sort songs
  const filteredAndSortedSongs = availableSongs
    .filter(
      (song) =>
        song.track_name.toLowerCase().includes(searchFilter.toLowerCase()) ||
        song.artist_name_s.toLowerCase().includes(searchFilter.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'artist') {
        return a.artist_name_s.localeCompare(b.artist_name_s);
      }
      return a.track_name.localeCompare(b.track_name);
    });

  const handleSongToggle = (song: DbSong) => {
    const isSelected = selectedSongs.some((s) => s.id === song.id);

    if (isSelected) {
      // Remove song
      onSongsChange(selectedSongs.filter((s) => s.id !== song.id));
    } else {
      // Add song (if under limit)
      if (selectedSongs.length < MAX_SONG_SELECTION) {
        onSongsChange([...selectedSongs, song]);
      }
    }
  };

  const handleRemoveSelectedSong = (songId: string) => {
    onSongsChange(selectedSongs.filter((s) => s.id !== songId));
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
    <div className="song-selector">
      {/* ✅ REMOVED: <h3>Choose Your Songs</h3> - now handled by step card header */}
      {/* 🟢 CHANGED: Added step-description class, removed duplicate heading */}
      <p className="step-description">Select {MIN_SONG_SELECTION}-{MAX_SONG_SELECTION} songs from our database</p>
      
      {/* Selected Songs Display */}
      {selectedSongs.length > 0 && (
        <div className='selected-songs'>
          <h4>
            Selected Songs ({selectedSongs.length}/{MAX_SONG_SELECTION})
          </h4>
          <div className='selected-songs-list'>
            {selectedSongs.map((song) => (
              <div key={song.id} className='selected-song-chip'>
                <span className='song-info'>
                  {song.track_name} - {song.artist_name_s}
                </span>
                <button
                  onClick={() => handleRemoveSelectedSong(song.id)}
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
                const isSelected = selectedSongs.some((s) => s.id === song.id);
                const isDisabled =
                  !isSelected && selectedSongs.length >= MAX_SONG_SELECTION;

                return (
                  <div
                    key={song.id}
                    className={`song-item ${isSelected ? 'selected' : ''} ${
                      isDisabled ? 'disabled' : ''
                    }`}
                  >
                    <label className='song-checkbox'>
                      <input
                        type='checkbox'
                        checked={isSelected}
                        onChange={() => handleSongToggle(song)}
                        disabled={isDisabled}
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
