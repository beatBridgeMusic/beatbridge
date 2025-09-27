// src/features/transitions/constants.ts
import type { OrderingMetric } from './types';

// Available metrics for ordering songs
export const ORDERING_METRICS: Array<{
  value: OrderingMetric;
  label: string;
  description: string;
}> = [
  {
    value: 'tempo',
    label: 'Tempo (BPM)',
    description: 'Order by beats per minute - slow to fast or fast to slow'
  },
  {
    value: 'energy',
    label: 'Energy Level',
    description: 'Order by intensity - calm to energetic or energetic to calm'
  },
  {
    value: 'valence',
    label: 'Mood (Valence)',
    description: 'Order by positivity - sad to happy or happy to sad'
  },
  {
    value: 'danceability',
    label: 'Danceability',
    description: 'Order by how danceable - chill to dance or dance to chill'
  },
  {
    value: 'loudness',
    label: 'Volume',
    description: 'Order by loudness level - quiet to loud or loud to quiet'
  },
  {
    value: 'popularity',
    label: 'Popularity',
    description: 'Order by how popular - hidden gems to hits or hits to gems'
  }
];

// Default playlist duration options
export const DURATION_OPTIONS = [
  { value: 30, label: '30 minutes' },
  { value: 45, label: '45 minutes' },
  { value: 60, label: '1 hour' },
  { value: 90, label: '1.5 hours' },
  { value: 120, label: '2 hours' }
];

// Maximum number of songs a user can select
export const MAX_SONG_SELECTION = 20;

// Minimum number of songs needed to create a playlist
export const MIN_SONG_SELECTION = 3;