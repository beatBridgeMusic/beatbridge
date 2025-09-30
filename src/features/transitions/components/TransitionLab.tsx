// src/features/transitions/components/TransitionLab.tsx
import React, { useState } from 'react';
import type {
  DbSong,
  OrderingMetric,
  OrderedPlaylist as OrderedPlaylistType,
} from '../types';
import { MIN_SONG_SELECTION } from '../constants';
import { SongSelector } from './SongSelector.js';
import { MetricSelector } from './MetricSelector.js';
import { DurationInput } from './DurationInput.js';
import { OrderedPlaylist } from './OrderedPlaylist.js';

export const TransitionLab: React.FC = () => {
  // State management
  const [selectedSongs, setSelectedSongs] = useState<DbSong[]>([]);
  const [selectedMetric, setSelectedMetric] = useState<OrderingMetric | null>(
    null
  );
  const [orderDirection, setOrderDirection] = useState<'asc' | 'desc'>('asc');
  const [customDuration, setCustomDuration] = useState<number | null>(null);
  const [orderedPlaylist, setOrderedPlaylist] =
    useState<OrderedPlaylistType | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Check if we can generate a playlist
  const canGenerate =
    selectedSongs.length >= MIN_SONG_SELECTION && selectedMetric;

  const handleGeneratePlaylist = async () => {
    if (!canGenerate) return;

    setIsGenerating(true);

    try {
      // TODO: Replace with actual API call
      // const response = await fetch('/api/transitions/order', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     songs: selectedSongs,
      //     metric: selectedMetric,
      //     direction: orderDirection,
      //     duration: customDuration
      //   })
      // });
      // const data = await response.json();

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Mock ordering logic (will be replaced by Will's backend)
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

      // Apply duration filtering if specified
      let finalSongs = orderedSongs;
      if (customDuration) {
        const targetDurationMs = customDuration * 60000;
        let currentDuration = 0;
        finalSongs = [];

        // Add songs until we reach target duration
        for (const song of orderedSongs) {
          if (currentDuration + song.duration_ms <= targetDurationMs) {
            finalSongs.push(song);
            currentDuration += song.duration_ms;
          } else {
            break;
          }
        }

        // If we haven't reached target duration, repeat songs
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

      const totalDuration = Math.round(
        finalSongs.reduce((sum, song) => sum + song.duration_ms, 0) / 60000
      );

      const playlist: OrderedPlaylistType = {
        id: `playlist-${Date.now()}`,
        songs: finalSongs,
        orderingMetric: selectedMetric,
        totalDuration,
        createdAt: new Date(),
      };

      setOrderedPlaylist(playlist);
    } catch (error) {
      console.error('Failed to generate playlist:', error);
      // TODO: Add proper error handling
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
  };

  return (
    <div className='transition-lab'>
      {/* Header */}
      <header className='lab-header'>
        <h1>🎵 BeatBridge</h1>
        <p>Order your customized playlist by any metric for the perfect flow</p>
      </header>

      <div className='lab-content'>
        {/* Configuration Section */}
        <div className='configuration-section'>

         {/* Step 1: Song Selection */}
<div className='config-step-card'>
  <div className='step-header'>
    <div className='step-number'>Step 1</div>
    <div className='step-title'>Choose Your Songs</div> {/* Add this back */}
  </div>
  <div className='step-content'>
    <SongSelector
      selectedSongs={selectedSongs}
      onSongsChange={setSelectedSongs}
    />
  </div>
</div>

{/* Step 2: Metric Selection */}
{selectedSongs.length >= MIN_SONG_SELECTION && (
  <div className='config-step-card'>
    <div className='step-header'>
      <div className='step-number'>Step 2</div>
      <div className='step-title'>Choose Your Flow</div> {/* Add this back */}
    </div>
    <div className='step-content'>
      <MetricSelector
        selectedMetric={selectedMetric}
        onMetricChange={setSelectedMetric}
        orderDirection={orderDirection}
        onDirectionChange={setOrderDirection}
      />
    </div>
  </div>
)}

{/* Step 3: Duration (Optional) */}
{selectedMetric && (
  <div className='config-step-card'>
    <div className='step-header'>
      <div className='step-number'>Step 3</div>
      <div className='step-title'>Set Duration</div> {/* Add this back */}
      <div className='step-optional'>(Optional)</div> {/* Add this back */}
    </div>
    <div className='step-content'>
      <DurationInput
        selectedSongs={selectedSongs}
        customDuration={customDuration}
        onDurationChange={setCustomDuration}
      />
    </div>
  </div>
)}

{/* Generate Button */}
{canGenerate && (
  <div className='generate-section-card'>
    <h3>Ready to Create Your Beat Bridge!</h3> {/* Add heading */}
    <button
      onClick={handleGeneratePlaylist}
      disabled={isGenerating}
      className='generate-playlist-btn'
    >
      {isGenerating ? 'Creating Your Beat Bridge...' : 'Create Beat Bridge'}
    </button>
    {/* ✅ REMOVED: generation-preview div - redundant summary */}
  </div>
)}
        </div>

        {/* Results Section */}
        <div className='results-section'>
          <OrderedPlaylist
            playlist={orderedPlaylist}
            isGenerating={isGenerating}
            onCreateNew={handleCreateNew}
          />
        </div>
      </div>
    </div>
  );
};
