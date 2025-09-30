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
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <h3 className="text-2xl font-bold text-white mb-6">🎵 Creating Your Beat Bridge...</h3>
        <div className="flex gap-2 mb-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="w-2 h-16 bg-gradient-to-t from-blue-500 to-purple-500 rounded-full animate-pulse"
              style={{ animationDelay: `${i * 0.1}s` }}
            />
          ))}
        </div>
        <p className="text-white/70">Analyzing your songs and creating the perfect flow...</p>
      </div>
    );
  }

  if (!playlist) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
        <h3 className="text-2xl font-bold text-white mb-3">Your Beat Bridge Will Appear Here</h3>
        <p className="text-white/70">Select songs, choose a metric, and create your perfectly ordered playlist!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Playlist Header */}
      <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-xl p-6 border border-white/20">
        <h2 className="text-3xl font-bold text-white mb-3">🎵 Your Beat Bridge</h2>
        <div className="flex flex-wrap gap-4 text-white/80">
          <span className="bg-white/10 px-3 py-1 rounded-full">
            {playlist.songs.length} songs
          </span>
          <span className="bg-white/10 px-3 py-1 rounded-full">
            {playlist.totalDuration} minutes
          </span>
          <span className="bg-white/10 px-3 py-1 rounded-full">
            Ordered by {getMetricLabel(playlist.orderingMetric)}
          </span>
        </div>
      </div>

      {/* Playlist Songs */}
      <div className="space-y-3">
        {playlist.songs.map((song, index) => (
          <div 
            key={`${song.id}-${index}`} 
            className="bg-white/5 hover:bg-white/10 rounded-lg p-4 border border-white/10 transition-all group"
          >
            <div className="flex items-start gap-4">
              {/* Song Number */}
              <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                {index + 1}
              </div>
              
              {/* Song Info */}
              <div className="flex-1 min-w-0">
                <h4 className="text-white font-semibold truncate group-hover:text-blue-400 transition-colors">
                  {song.track_name}
                </h4>
                <p className="text-white/70 text-sm truncate">{song.artist_name_s}</p>
                <div className="flex flex-wrap gap-2 mt-1 text-xs text-white/50">
                  <span>{formatDuration(song.duration_ms)}</span>
                  <span>•</span>
                  <span>{song.genres}</span>
                  {song.explicit && <span className="bg-red-500/20 text-red-400 px-2 py-0.5 rounded">🅴</span>}
                </div>
              </div>

              {/* Metric Value */}
              <div className="flex-shrink-0 text-right">
                <div className="text-white/50 text-xs">{getMetricLabel(playlist.orderingMetric)}</div>
                <div className="text-white font-semibold">
                  {getMetricValue(song, playlist.orderingMetric)}
                </div>
              </div>
            </div>

            {/* Flow Arrow */}
            {index < playlist.songs.length - 1 && (
              <div className="flex justify-center mt-2">
                <div className="text-white/30 text-xl">↓</div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Playlist Actions */}
      <div className="space-y-4">
        <button 
          onClick={onCreateNew} 
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold py-4 px-8 rounded-lg transition-all shadow-lg"
        >
          Create Another Beat Bridge
        </button>
        
        <div className="flex gap-3">
          <button 
            disabled
            className="flex-1 bg-white/10 text-white/50 py-3 px-6 rounded-lg cursor-not-allowed"
          >
            Export Playlist
          </button>
          <button 
            disabled
            className="flex-1 bg-white/10 text-white/50 py-3 px-6 rounded-lg cursor-not-allowed"
          >
            Share Beat Bridge
          </button>
        </div>
        <p className="text-center text-white/50 text-xs">Export and share features coming soon!</p>
      </div>

      {/* Playlist Insights */}
      <div className="bg-white/5 rounded-xl p-6 border border-white/10">
        <h4 className="text-white font-semibold mb-4">Flow Analysis</h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white/5 rounded-lg p-4">
            <div className="text-white/50 text-sm mb-1">Avg {getMetricLabel(playlist.orderingMetric)}</div>
            <div className="text-white font-bold text-lg">
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
            </div>
          </div>
          
          <div className="bg-white/5 rounded-lg p-4">
            <div className="text-white/50 text-sm mb-1">Flow Direction</div>
            <div className="text-white font-bold text-lg">
              {(() => {
                if (playlist.songs.length < 2) return 'N/A';
                const first = playlist.songs[0];
                const last = playlist.songs[playlist.songs.length - 1];
                const firstValue = first[playlist.orderingMetric];
                const lastValue = last[playlist.orderingMetric];
                return firstValue < lastValue ? 'Ascending ↗' : 'Descending ↘';
              })()}
            </div>
          </div>
          
          <div className="bg-white/5 rounded-lg p-4">
            <div className="text-white/50 text-sm mb-1">Genres</div>
            <div className="text-white font-bold text-lg">
              {(() => {
                const genres = [...new Set(playlist.songs.map(s => s.genres))];
                return genres.length <= 3 ? genres.join(', ') : `${genres.slice(0, 2).join(', ')} +${genres.length - 2}`;
              })()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

