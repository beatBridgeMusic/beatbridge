// src/features/transitions/components/DurationInput.tsx
import React from 'react';
import type { DbSong } from '../types';
import { DURATION_OPTIONS } from '../constants';

interface DurationInputProps {
  selectedSongs: DbSong[];
  customDuration: number | null;
  onDurationChange: (duration: number | null) => void;
}

export const DurationInput: React.FC<DurationInputProps> = ({
  selectedSongs,
  customDuration,
  onDurationChange
}) => {
  // Calculate total duration of selected songs
  const totalSelectedDuration = selectedSongs.reduce((total, song) => {
    return total + song.duration_ms;
  }, 0);

  const totalSelectedMinutes = Math.round(totalSelectedDuration / 60000);

  const formatDuration = (minutes: number) => {
    if (minutes >= 60) {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      return remainingMinutes > 0 
        ? `${hours}h ${remainingMinutes}m`
        : `${hours}h`;
    }
    return `${minutes}m`;
  };

  const handlePresetSelect = (duration: number) => {
    onDurationChange(duration);
  };

  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (isNaN(value) || value <= 0) {
      onDurationChange(null);
    } else {
      onDurationChange(value);
    }
  };

  const handleClearDuration = () => {
    onDurationChange(null);
  };

  return (
    <div className="duration-input">
      <h3>Playlist Duration (Optional)</h3>
      <p>Set a target duration to trim or repeat your playlist</p>
      
      {/* Current Selection Info */}
      {selectedSongs.length > 0 && (
        <div className="current-duration-info">
          <p className="selected-duration">
            Your {selectedSongs.length} selected songs total: <strong>{formatDuration(totalSelectedMinutes)}</strong>
          </p>
        </div>
      )}

      {/* Duration Options */}
      <div className="duration-options">
        <h4>Quick Options:</h4>
        <div className="preset-buttons">
          {DURATION_OPTIONS.map(option => (
            <button
              key={option.value}
              className={`preset-btn ${customDuration === option.value ? 'selected' : ''}`}
              onClick={() => handlePresetSelect(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Custom Duration Input */}
      <div className="custom-duration">
        <h4>Custom Duration:</h4>
        <div className="custom-input-group">
          <input
            type="number"
            min="5"
            max="300"
            value={customDuration || ''}
            onChange={handleCustomChange}
            placeholder="Enter minutes..."
            className="custom-duration-input"
          />
          <span className="input-suffix">minutes</span>
          {customDuration && (
            <button 
              onClick={handleClearDuration}
              className="clear-duration-btn"
              title="Clear duration limit"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Duration Effect Explanation */}
      {customDuration && (
        <div className="duration-explanation">
          {customDuration < totalSelectedMinutes ? (
            <div className="warning">
              <p>⚠️ Target duration is shorter than your selected songs.</p>
              <p>We'll trim the playlist to fit {formatDuration(customDuration)}.</p>
            </div>
          ) : customDuration > totalSelectedMinutes ? (
            <div className="info">
              <p>ℹ️ Target duration is longer than your selected songs.</p>
              <p>We'll repeat songs to reach {formatDuration(customDuration)}.</p>
            </div>
          ) : (
            <div className="success">
              <p>✅ Perfect! Your songs exactly match {formatDuration(customDuration)}.</p>
            </div>
          )}
        </div>
      )}

      {/* No Duration Set */}
      {!customDuration && (
        <div className="no-duration-info">
          <p>No duration limit set - we'll use all your selected songs in order.</p>
        </div>
      )}
    </div>
  );
};