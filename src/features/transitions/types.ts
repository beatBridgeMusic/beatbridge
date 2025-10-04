// src/features/transitions/types.ts

// Database song structure (matches Will's Supabase table)
export interface DbSong {
  id: string;
  track_uri: string;
  track_name: string;
  album_name: string;
  artist_names: string;
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

// Available metrics for ordering songs
export type OrderingMetric = 'tempo' | 'energy' | 'valence' | 'danceability' | 'loudness' | 'popularity';

// User's playlist configuration
export interface PlaylistConfig {
  selectedSongs: DbSong[];
  orderingMetric: OrderingMetric;
  customDuration?: number; // in minutes
}

// Final ordered playlist
export interface OrderedPlaylist {
  id: string;
  songs: DbSong[];
  orderingMetric: OrderingMetric;
  totalDuration: number; // in minutes
  createdAt: Date;
}

// API response types
export interface SongSearchResponse {
  songs: DbSong[];
  total: number;
}

export interface OrderPlaylistResponse {
  playlist: OrderedPlaylist;
}
