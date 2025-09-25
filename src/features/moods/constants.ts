// src/features/moods/constants.ts
import type { Mood } from './types';

export const FITNESS_MOOD: Mood = { //
  id: 'fitness',
  name: 'Fitness Beat',
  description: 'Perfect for workouts, runs, and gym sessions',
  icon: '🏊🏽‍♂️ 🏃‍♀️ 🤾🏾‍♀️ 🧘‍♂️ 🏋🏿‍♀️ 🤸‍♀️ ',
  totalDuration: 60,
  phases: [
    {
      id: 'warm-up',
      name: 'Warm Up',
      description: 'Get your body ready and motivated',
      duration: 10,
      energyLevel: 'medium'
    },
    {
      id: 'build',
      name: 'Build',
      description: 'Increase intensity and find your rhythm',
      duration: 15,
      energyLevel: 'high'
    },
    {
      id: 'peak',
      name: 'Peak Performance',
      description: 'Maximum intensity and power',
      duration: 25,
      energyLevel: 'high'
    },
    {
      id: 'cool-down',
      name: 'Cool Down',
      description: 'Gradually decrease intensity and stretch',
      duration: 10,
      energyLevel: 'low'
    }
  ]
};
//add more moods later, study session, relaxaxtion, focus, party, road trip, sleep, etc

export const AVAILABLE_MOODS = [FITNESS_MOOD];