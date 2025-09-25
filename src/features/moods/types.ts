// src/features/moods/types.ts

export interface MoodPhase {
  id: string;
  name: string;
  description: string;
  duration: number; // in minutes
  energyLevel: 'low' | 'medium' | 'high';
}

export interface Mood {
  id: string;
  name: string;
  description: string;
  icon: string;
  phases: MoodPhase[];
  totalDuration: number;
}

export interface UserMoodInput {
  favoriteArtists: string[];
  favoriteSongs: string[];
  customDuration?: number; // optional override
}

export interface GeneratedPlaylist {
  id: string;
  moodId: string;
  title: string;
  songs: PlaylistSong[];
  totalDuration: number;
  createdAt: Date;
}

export interface PlaylistSong {
  title: string;
  artist: string;
  phase: string;
  reasoning: string; // AI explanation for why this song fits
}