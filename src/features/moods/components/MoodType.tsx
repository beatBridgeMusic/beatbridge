import React, { useState } from 'react';
import type { Mood, UserMoodInput as UserMoodInputType, GeneratedPlaylist } from '../types'; 
import { MoodSelector } from './MoodSelector.js';
import { UserMoodInput } from './UserMoodInput';

export const MoodType: React.FC = () => {
  const [selectedMood, setSelectedMood] = useState<Mood | null>(null);
  const [generatedPlaylist, setGeneratedPlaylist] = useState<GeneratedPlaylist | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<'select' | 'input' | 'result'>('select');

  const handleMoodSelect = (mood: Mood) => {
    setSelectedMood(mood);
    setStep('input');
  };

  const handleUserInput = async () => { //removed input: UserMoodInputType for now
    if (!selectedMood) return;
    
    setIsLoading(true);
    
    try {
      // TODO: Replace with actual API call
      // const response = await apiService.generatePlaylist(selectedMood.id, input);
      
      // Mock response for now
      const mockPlaylist: GeneratedPlaylist = {
        id: 'mock-1',
        moodId: selectedMood.id,
        title: `${selectedMood.name} Mix`,
        totalDuration: selectedMood.totalDuration,
        createdAt: new Date(),
        songs: [
          {
            id: "mock-1",
            track_uri: "spotify:track:example1",
            track_name: "Eye of the Tiger",
            album_name: "Eye of the Tiger",
            artist_name_s: "Survivor",
            release_date: "1982-07-01",
            duration_ms: 246000,
            popularity: 85,
            explicit: false,
            added_by: "system",
            added_at: new Date().toISOString(),
            genres: "rock",
            record_label: "Scotti Brothers Records",
            danceability: 0.6,
            energy: 0.8,
            key: 7,
            loudness: -5.2,
            mode: 1,
            speechiness: 0.05,
            acousticness: 0.1,
            instrumentalness: 0.0,
            liveness: 0.2,
            valence: 0.9,
            tempo: 109.0,
            time_signature: 4,
            row_hash: "hash1",
            phase: "warm-up",
            reasoning: "Classic motivational track to get you started",
            order_in_phase: 1
          },
          {
            id: "mock-2",
            track_uri: "spotify:track:example2",
            track_name: "Stronger",
            album_name: "Graduation",
            artist_name_s: "Kanye West",
            release_date: "2007-09-11",
            duration_ms: 311000,
            popularity: 78,
            explicit: true,
            added_by: "system",
            added_at: new Date().toISOString(),
            genres: "hip-hop",
            record_label: "Roc-A-Fella Records",
            danceability: 0.7,
            energy: 0.85,
            key: 5,
            loudness: -4.8,
            mode: 0,
            speechiness: 0.15,
            acousticness: 0.02,
            instrumentalness: 0.0,
            liveness: 0.1,
            valence: 0.8,
            tempo: 104.0,
            time_signature: 4,
            row_hash: "hash2",
            phase: "build",
            reasoning: "Perfect for building momentum",
            order_in_phase: 1
          },
          {
            id: "mock-3",
            track_uri: "spotify:track:example3",
            track_name: "Till I Collapse",
            album_name: "The Eminem Show",
            artist_name_s: "Eminem",
            release_date: "2002-05-26",
            duration_ms: 297000,
            popularity: 88,
            explicit: true,
            added_by: "system",
            added_at: new Date().toISOString(),
            genres: "hip-hop",
            record_label: "Aftermath Entertainment",
            danceability: 0.65,
            energy: 0.9,
            key: 2,
            loudness: -4.2,
            mode: 1,
            speechiness: 0.25,
            acousticness: 0.01,
            instrumentalness: 0.0,
            liveness: 0.15,
            valence: 0.75,
            tempo: 85.0,
            time_signature: 4,
            row_hash: "hash3",
            phase: "peak",
            reasoning: "High-energy anthem for maximum effort",
            order_in_phase: 1
          },
          {
            id: "mock-4",
            track_uri: "spotify:track:example4",
            track_name: "Breathe Me",
            album_name: "Colour the Small One",
            artist_name_s: "Sia",
            release_date: "2004-01-19",
            duration_ms: 268000,
            popularity: 72,
            explicit: false,
            added_by: "system",
            added_at: new Date().toISOString(),
            genres: "electronic",
            record_label: "Monkey Puzzle Records",
            danceability: 0.4,
            energy: 0.3,
            key: 9,
            loudness: -8.5,
            mode: 0,
            speechiness: 0.03,
            acousticness: 0.6,
            instrumentalness: 0.0,
            liveness: 0.1,
            valence: 0.3,
            tempo: 95.0,
            time_signature: 4,
            row_hash: "hash4",
            phase: "cool-down",
            reasoning: "Calming track to help you wind down",
            order_in_phase: 1
          }
        ]
      };
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setGeneratedPlaylist(mockPlaylist);
      setStep('result');
    } catch (error) {
      console.error('Failed to generate playlist:', error);
      // TODO: Add error handling
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartOver = () => {
    setSelectedMood(null);
    setGeneratedPlaylist(null);
    setStep('select');
  };

  return (
    <div className="mood-journey">
      {step === 'select' && (
        <MoodSelector 
          selectedMood={selectedMood}
          onMoodSelect={handleMoodSelect}
        />
      )}
      
      {step === 'input' && selectedMood && (
        <div className="input-step">
          <div className="selected-mood-header">
            <span className="mood-icon">{selectedMood.icon}</span>
            <h2>{selectedMood.name}</h2>
            <button onClick={handleStartOver} className="change-mood-btn">
              Change Mood
            </button>
          </div>
          <UserMoodInput 
            onSubmit={handleUserInput}
            isLoading={isLoading}
          />
        </div>
      )}
      
      {step === 'result' && generatedPlaylist && selectedMood && (
        <div className="result-step">
          <h2>Your {selectedMood.name} Playlist</h2>
          <div className="playlist-info">
            <p>Duration: {generatedPlaylist.totalDuration} minutes</p>
            <p>Songs: {generatedPlaylist.songs.length}</p>
          </div>
          
          <div className="playlist-songs">
            {generatedPlaylist.songs.map((song) => ( //removed index parameter for now
              <div key={song.id} className="song-item">
                <div className="song-details">
                  <h4>{song.track_name}</h4>
                  <p>{song.artist_name_s}</p>
                  <span className="phase-tag">{song.phase}</span>
                  <span className="duration">{Math.round(song.duration_ms / 60000)}:{String(Math.round((song.duration_ms % 60000) / 1000)).padStart(2, '0')}</span>
                </div>
                <p className="song-reasoning">{song.reasoning}</p>
                <div className="audio-features">
                  <small>Energy: {song.energy.toFixed(1)} | Tempo: {song.tempo.toFixed(0)} BPM</small>
                </div>
              </div>
            ))}
          </div>
          
          <div className="action-buttons">
            <button onClick={handleStartOver} className="start-over-btn">
              Create Another Playlist
            </button>
            {/* TODO: Add export/share functionality */}
          </div>
        </div>
      )}
    </div>
  );
};