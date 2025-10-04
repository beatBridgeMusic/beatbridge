// src/features/transitions/components/TransitionLab.tsx
import React, { useState } from 'react';
import type { DbSong, OrderingMetric, OrderedPlaylist as OrderedPlaylistType } from '../types';
import { MIN_SONG_SELECTION } from '../constants';
import { SongSelector } from './SongSelector.js';
import { MetricSelector } from './MetricSelector.js';
import { DurationInput } from './DurationInput.js';
import { OrderedPlaylist } from './OrderedPlaylist.js';
import { useAuth } from '../../../AuthContext';
import { useNavigate } from 'react-router-dom';
import UploadCSV from '../../../components/UploadCSV';
import SpotifyPlayer from 'react-spotify-web-playback';

export const TransitionLab: React.FC = () => {
  // State management
  const [selectedSongs, setSelectedSongs] = useState<DbSong[]>([]);
  const [selectedMetric, setSelectedMetric] = useState<OrderingMetric | null>(null);
  const [orderDirection, setOrderDirection] = useState<'asc' | 'desc'>('asc');
  const [customDuration, setCustomDuration] = useState<number | null>(null);
  const [orderedPlaylist, setOrderedPlaylist] = useState<OrderedPlaylistType | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [lastUploadTime, setLastUploadTime] = useState<number>(Date.now());
  const [playerUris, setPlayerUris] = useState<string[]>([]);

  const { user, logout } = useAuth();
  // Check if we can generate a playlist
  const canGenerate = selectedSongs.length >= MIN_SONG_SELECTION && selectedMetric;

  const handleGeneratePlaylist = async () => {
    if (!canGenerate) return;
    setIsGenerating(true);

    try {
      const orderedSongs = [...selectedSongs].sort((a, b) => {
        let aValue: number, bValue: number;

        switch (selectedMetric) {
          case 'tempo':
            aValue = a.tempo;
            bValue = b.tempo;
            break;
          case 'energy':
            aValue = a.energy;
            bValue = b.energy;
            break;
          case 'valence':
            aValue = a.valence;
            bValue = b.valence;
            break;
          case 'danceability':
            aValue = a.danceability;
            bValue = b.danceability;
            break;
          case 'loudness':
            aValue = a.loudness;
            bValue = b.loudness;
            break;
          case 'popularity':
            aValue = a.popularity;
            bValue = b.popularity;
            break;
          default:
            return 0;
        }

        return orderDirection === 'asc' ? aValue - bValue : bValue - aValue;
      });

      let finalSongs = orderedSongs;
      if (customDuration) {
        const targetDurationMs = customDuration * 60000;
        let currentDuration = 0;
        finalSongs = [];

        for (const song of orderedSongs) {
          if (currentDuration + song.duration_ms <= targetDurationMs) {
            finalSongs.push(song);
            currentDuration += song.duration_ms;
          } else {
            break;
          }
        }

        if (currentDuration < targetDurationMs && orderedSongs.length > 0) {
          let songIndex = 0;
          while (currentDuration < targetDurationMs) {
            const song = orderedSongs[songIndex % orderedSongs.length];
            if (currentDuration + song.duration_ms <= targetDurationMs) {
              finalSongs.push(song);
              currentDuration += song.duration_ms;
            } else {
              break;
            }
            songIndex++;
          }
        }
      }

      const totalDuration = Math.round(finalSongs.reduce((sum, song) => sum + song.duration_ms, 0) / 60000);

      const playlist: OrderedPlaylistType = {
        id: `playlist-${Date.now()}`,
        songs: finalSongs,
        orderingMetric: selectedMetric,
        totalDuration,
        createdAt: new Date(),
      };

      // Update the player URIs with the ordered song URIs
      const songUris = finalSongs.map((song) => song.track_uri);
      setPlayerUris(songUris);

      setOrderedPlaylist(playlist);
    } catch (error) {
      console.error('Failed to generate playlist:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCreateNew = () => {
    setSelectedSongs([]);
    setSelectedMetric(null);
    setOrderDirection('asc');
    setCustomDuration(null);
    setOrderedPlaylist(null);
    setPlayerUris(['spotify:track:5VfEuwErhx6X4eaPbyBfyu']);
  };
  const navigate = useNavigate();
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  return (
    <div className='relative bg-animated min-h-screen'>
      {/* Overlay for depth */}
      <div className='absolute inset-0 bg-black/20 z-0'></div>

      {/* Floating musical elements */}
      <div className='absolute inset-0 overflow-hidden pointer-events-none'>
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className='absolute text-white/20 text-xl'
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `bounce ${3 + Math.random() * 2}s infinite`,
              animationDelay: `${Math.random() * 3}s`,
            }}
          >
            🎵
          </div>
        ))}
      </div>

      {/* Header */}
      <header className='relative z-50 text-center text-white pt-8 pb-6'>
        <div className='flex justify-between items-center max-w-4xl mx-auto px-4 mb-4'>
          <div></div> {/* Spacer for centering */}
          {user && (
            <div className='flex items-center gap-4 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20'>
              <span className='text-sm'>Hello, {user.username ?? user.email}</span>
              <button
                onClick={handleLogout}
                className='bg-red-500 hover:bg-red-600 text-white px-4 py-1 rounded-full text-sm font-medium transition-colors'
              >
                Logout
              </button>
            </div>
          )}
        </div>
        <div className="flex flex-col items-center gap-4">
          <img 
            src="/beatbridge_gradient.png" 
            alt="BeatBridge Logo" 
            className="w-50 h-50 object-contain"
          />
          <h1 className='text-4xl font-extrabold bg-gradient-to-r from-blue-600 via-purple-600 to-orange-600 text-transparent bg-clip-text'>
            🎵 BeatBridge 🎵
          </h1>
          <p className='text-lg font-light'>Order your customized playlist by any metric for the perfect flow</p>
        </div>
      </header>

      <div className='mt-4 mb-4'>
        <SpotifyPlayer
          styles={{
            activeColor: '#fff',
            bgColor: '#333',
            color: '#fff',
            loaderColor: '#fff',
            sliderColor: '#1cb954',
            trackArtistColor: '#ccc',
            trackNameColor: '#fff',
            height: 80,
          }}
          token='BQAV_CtBTXtwQuBxNkgH8SIse_Du0ipduItydlPgBZdSWThAKtkz4FoMkuiDJqwrEPzU-GfAiBb8CWcUP17nzEnrbzquJJKbLMesnKx2MpblAJPP8qSoVs8PLLhECTBqo8MRT0hM4Vtuxhnk98S0B9KIChIxGueXBTQGOZU0RpvtQ_BBed3gdA7bLws0n2A6zgH8OzA7TK3DY52edTp3hyaK51uluDHdTrD5Jsf48RHftfUf'
          name='BeatBridge Web Player'
          autoPlay={false}
          play={true}
          magnifySliderOnHover={true}
          uris={playerUris}
          callback={(state) => {
            if (state.error) {
              console.error('Spotify Player Error:', state.error);
            }
          }}
        />
      </div>
      <UploadCSV onUploadSuccess={() => setLastUploadTime(Date.now())} />

      <div className='relative z-40 max-w-4xl mx-auto px-4 pb-12'>
        {/* Configuration Section */}
        <div className='space-y-6'>
          {/* Step 1: Song Selection */}
          <div className='bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 shadow-lg'>
            <div className='flex items-center gap-4 mb-4'>
              <div className='bg-yellow-500 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold'>
                1
              </div>
              <h2 className='text-xl font-semibold text-white'>Choose Songs from a Playlist</h2>
            </div>
            <SongSelector
              selectedSongs={selectedSongs}
              onSongsChange={setSelectedSongs}
              lastUploadTime={lastUploadTime}
            />
          </div>

          {/* Step 2: Metric Selection */}
          {selectedSongs.length >= MIN_SONG_SELECTION && (
            <div className='bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 shadow-lg'>
              <div className='flex items-center gap-4 mb-4'>
                <div className='bg-green-500 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold'>
                  2
                </div>
                <h2 className='text-xl font-semibold text-white'>Choose Your Flow Metric</h2>
              </div>
              <MetricSelector
                selectedMetric={selectedMetric}
                onMetricChange={setSelectedMetric}
                orderDirection={orderDirection}
                onDirectionChange={setOrderDirection}
              />
            </div>
          )}

          {/* Step 3: Duration */}
          {selectedMetric && (
            <div className='bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 shadow-lg'>
              <div className='flex items-center gap-4 mb-4'>
                <div className='bg-purple-500 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold'>
                  3
                </div>
                <h2 className='text-xl font-semibold text-white'>Set Duration</h2>
                <span className='text-sm text-white/70 bg-white/10 px-2 py-1 rounded-full'>(Optional)</span>
              </div>
              <DurationInput
                selectedSongs={selectedSongs}
                customDuration={customDuration}
                onDurationChange={setCustomDuration}
              />
            </div>
          )}

          {/* Generate Button */}
          {canGenerate && (
            <div className='bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 shadow-xl border border-white/30'>
              <button
                onClick={handleGeneratePlaylist}
                disabled={isGenerating}
                className='w-full bg-white text-blue-600 py-4 px-8 rounded-lg font-bold text-lg hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
              >
                {isGenerating ? 'Creating Your Beat Bridge...' : 'Create Beat Bridge'}
              </button>
            </div>
          )}
        </div>

        {/* Results Section */}
        <div className='mt-8'>
          <OrderedPlaylist playlist={orderedPlaylist} isGenerating={isGenerating} onCreateNew={handleCreateNew} />
        </div>
      </div>
    </div>
  );
};
