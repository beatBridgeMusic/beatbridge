import React, { useState } from 'react';
//
import type { UserMoodInput as UserMoodInputType } from '../types';

interface UserMoodInputProps {
  onSubmit: (input: UserMoodInputType) => void;
  isLoading?: boolean;
}

export const UserMoodInput: React.FC<UserMoodInputProps> = ({ 
  onSubmit, 
  isLoading = false 
}) => {
  const [favoriteArtists, setFavoriteArtists] = useState<string[]>(['']);
  const [favoriteSongs, setFavoriteSongs] = useState<string[]>(['']);
  const [customDuration, setCustomDuration] = useState<number | undefined>();

  const addArtistField = () => {
    setFavoriteArtists([...favoriteArtists, '']);
  };

  const addSongField = () => {
    setFavoriteSongs([...favoriteSongs, '']);
  };

  const updateArtist = (index: number, value: string) => {
    const updated = [...favoriteArtists];
    updated[index] = value;
    setFavoriteArtists(updated);
  };

  const updateSong = (index: number, value: string) => {
    const updated = [...favoriteSongs];
    updated[index] = value;
    setFavoriteSongs(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const filteredArtists = favoriteArtists.filter(artist => artist.trim() !== '');
    const filteredSongs = favoriteSongs.filter(song => song.trim() !== '');
    
    onSubmit({
      favoriteArtists: filteredArtists,
      favoriteSongs: filteredSongs,
      customDuration
    });
  };

  return (
    <form className="user-mood-input" onSubmit={handleSubmit}>
      <h3>Tell us about your music taste</h3>
      
      <div className="input-section">
        <label>Favorite Artists</label>
        {favoriteArtists.map((artist, index) => (
          <input
            key={index}
            type="text"
            value={artist}
            onChange={(e) => updateArtist(index, e.target.value)}
            placeholder="Enter artist name"
            className="artist-input"
          />
        ))}
        <button type="button" onClick={addArtistField} className="add-field-btn">
          + Add Another Artist
        </button>
      </div>

      <div className="input-section">
        <label>Favorite Workout Songs (optional)</label>
        {favoriteSongs.map((song, index) => (
          <input
            key={index}
            type="text"
            value={song}
            onChange={(e) => updateSong(index, e.target.value)}
            placeholder="Enter song name"
            className="song-input"
          />
        ))}
        <button type="button" onClick={addSongField} className="add-field-btn">
          + Add Another Song
        </button>
      </div>

      <div className="input-section">
        <label>Custom Duration (optional)</label>
        <input
          type="number"
          value={customDuration || ''}
          onChange={(e) => setCustomDuration(e.target.value ? parseInt(e.target.value) : undefined)}
          placeholder="60"
          min="15"
          max="180"
          className="duration-input"
        />
        <small>Leave blank for default 60 minutes</small>
      </div>

      <button 
        type="submit" 
        className="generate-btn"
        disabled={isLoading || favoriteArtists.filter(a => a.trim()).length === 0}
      >
        {isLoading ? 'Generating Your Playlist...' : 'Generate My Fitness Playlist'}
      </button>
    </form>
  );
};