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

// Database song structure (from Will's Supabase table)
export interface DbSong {
  id: string;
  track_uri: string;
  track_name: string;
  album_name: string;
  artist_name_s: string;
  release_date: string;
  duration_ms: number;
  popularity: number;
  explicit: boolean;
  added_by: string;
  added_at: string;
  genres: string;
  record_label: string;
  // Audio features
  danceability: number;
  energy: number;
  key: number;
  loudness: number;
  mode: number;
  speechiness: number;
  acousticness: number;
  instrumentalness: number;
  liveness: number;
  valence: number;
  tempo: number;
  time_signature: number;
  row_hash: string;
}

// Frontend playlist song (DbSong + journey context)
export interface PlaylistSong extends DbSong {
  phase: string;
  reasoning: string; // AI explanation for why this song fits
  order_in_phase: number; // Position within the phase
}