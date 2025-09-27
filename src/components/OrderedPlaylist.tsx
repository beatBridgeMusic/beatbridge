// src/features/transitions/components/OrderedPlaylist.tsx
import React from 'react';
import type { OrderedPlaylist as OrderedPlaylistType, OrderingMetric, DbSong } from '../types';

interface OrderedPlaylistProps {
  playlist: OrderedPlaylistType | null;
  isGenerating: boolean;
  onCreateNew: () => void;
}

export const OrderedPlaylist: React.FC<OrderedPlaylistProps> = ({
  playlist,
  isGenerating,
  onCreateNew
}) => {
  const formatDuration = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const getMetricValue = (song: DbSong, metric: OrderingMetric): string => {
    switch (metric) {
      case 'tempo':
        return `${Math.round(song.tempo)} BPM`;
      case 'energy':
        return `${(song.energy * 100).toFixed(0)}%`;
      case 'valence':
        return `${(song.valence * 100).toFixed(0)}%`;
      case 'danceability':
        return `${(song.danceability * 100).toFixed(0)}%`;
      case 'loudness':
        return `${song.loudness.toFixed(1)} dB`;
      case 'popularity':
        return `${song.popularity}/100`;
      default:
        return '';
    }
  };

  const formatMetricValue = (value: number, metric: OrderingMetric): string => {
  switch (metric) {
    case 'tempo':
      return `${Math.round(value)} BPM`;
    case 'energy':
      return `${(value * 100).toFixed(0)}%`;
    case 'valence':
      return `${(value * 100).toFixed(0)}%`;
    case 'danceability':
      return `${(value * 100).toFixed(0)}%`;
    case 'loudness':
      return `${value.toFixed(1)} dB`;
    case 'popularity':
      return `${value}/100`;
    default:
      return '';
  }
};
  const getMetricLabel = (metric: OrderingMetric): string => {
    const labels = {
      tempo: 'Tempo',
      energy: 'Energy',
      valence: 'Mood',
      danceability: 'Danceability',
      loudness: 'Loudness',
      popularity: 'Popularity'
    };
    return labels[metric];
  };

  if (isGenerating) {
    return (
      <div className="ordered-playlist generating">
        <div className="generating-content">
          <h3>🎵 Creating Your Beat Bridge...</h3>
          <div className="loading-animation">
            <div className="beat-bars">
              <div className="bar"></div>
              <div className="bar"></div>
              <div className="bar"></div>
              <div className="bar"></div>
            </div>
          </div>
          <p>Analyzing your songs and creating the perfect flow...</p>
        </div>
      </div>
    );
  }

  if (!playlist) {
    return (
      <div className="ordered-playlist empty">
        <div className="empty-state">
          <h3>Your Beat Bridge Will Appear Here</h3>
          <p>Select songs, choose a metric, and create your perfectly ordered playlist!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="ordered-playlist">
      <div className="playlist-header">
        <h2>🎵 Your Beat Bridge</h2>
        <div className="playlist-meta">
          <span className="song-count">{playlist.songs.length} songs</span>
          <span className="total-duration">{playlist.totalDuration} minutes</span>
          <span className="ordering-info">
            Ordered by {getMetricLabel(playlist.orderingMetric)}
          </span>
        </div>
      </div>

      <div className="playlist-songs">
        {playlist.songs.map((song, index) => (
          <div key={`${song.id}-${index}`} className="playlist-song-item">
            <div className="song-number">{index + 1}</div>
            
            <div className="song-info">
              <h4 className="song-title">{song.track_name}</h4>
              <p className="song-artist">{song.artist_name_s}</p>
              <div className="song-meta">
                <span className="duration">{formatDuration(song.duration_ms)}</span>
                <span className="genre">{song.genres}</span>
                {song.explicit && <span className="explicit">🅴</span>}
              </div>
            </div>

            <div className="metric-value">
              <span className="metric-label">{getMetricLabel(playlist.orderingMetric)}</span>
              <span className="metric-number">
                {getMetricValue(song, playlist.orderingMetric)}
              </span>
            </div>

            <div className="transition-indicator">
              {index < playlist.songs.length - 1 && (
                <div className="flow-arrow">→</div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="playlist-actions">
        <button onClick={onCreateNew} className="create-new-btn">
          Create Another Beat Bridge
        </button>
        
        <div className="export-options">
          <button className="export-btn" disabled>
            Export Playlist
          </button>
          <button className="share-btn" disabled>
            Share Beat Bridge
          </button>
          <small>Export and share features coming soon!</small>
        </div>
      </div>

      <div className="playlist-insights">
        <h4>Flow Analysis</h4>
        <div className="insights-grid">
          <div className="insight-item">
            <span className="insight-label">Avg {getMetricLabel(playlist.orderingMetric)}</span>
            <span className="insight-value">
              {playlist.songs.length > 0 && (() => {
                const sum = playlist.songs.reduce((acc, song) => {
                  const value = playlist.orderingMetric === 'tempo' ? song.tempo :
                               playlist.orderingMetric === 'energy' ? song.energy :
                               playlist.orderingMetric === 'valence' ? song.valence :
                               playlist.orderingMetric === 'danceability' ? song.danceability :
                               playlist.orderingMetric === 'loudness' ? song.loudness :
                               song.popularity;
                  return acc + value;
                }, 0);
                const avg = sum / playlist.songs.length;
                return formatMetricValue(avg, playlist.orderingMetric);
              })()}
            </span>
          </div>
          
          <div className="insight-item">
            <span className="insight-label">Flow Direction</span>
            <span className="insight-value">
              {(() => {
                if (playlist.songs.length < 2) return 'N/A';
                const first = playlist.songs[0];
                const last = playlist.songs[playlist.songs.length - 1];
                const firstValue = first[playlist.orderingMetric];
                const lastValue = last[playlist.orderingMetric];
                return firstValue < lastValue ? 'Ascending ↗' : 'Descending ↘';
              })()}
            </span>
          </div>
          
          <div className="insight-item">
            <span className="insight-label">Genres</span>
            <span className="insight-value">
              {(() => {
                const genres = [...new Set(playlist.songs.map(s => s.genres))];
                return genres.length <= 3 ? genres.join(', ') : `${genres.slice(0, 2).join(', ')} +${genres.length - 2} more`;
              })()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};