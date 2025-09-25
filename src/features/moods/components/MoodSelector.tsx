// src/features/moods/components/MoodSelector.tsx
import React from 'react';
import type { Mood } from '../types';
import { AVAILABLE_MOODS } from '../constants';

interface MoodSelectorProps {
  selectedMood: Mood | null;
  onMoodSelect: (mood: Mood) => void;
}

export const MoodSelector: React.FC<MoodSelectorProps> = ({
  selectedMood,
  onMoodSelect
}) => {
  return (
    <div className="mood-selector">
      <h2>Choose Your Musical Journey</h2>
      <div className="mood-cards">
        {AVAILABLE_MOODS.map((mood) => (
          <div
            key={mood.id}
            className={`mood-card ${selectedMood?.id === mood.id ? 'selected' : ''}`}
            onClick={() => onMoodSelect(mood)}
          >
            <div className="mood-icon">{mood.icon}</div>
            <h3>{mood.name}</h3>
            <p>{mood.description}</p>
            <div className="mood-duration">{mood.totalDuration} minutes</div>
            
            <div className="mood-phases">
              {mood.phases.map( phase => ( // removed index parameter for now
                <div key={phase.id} className="phase-item">
                  <span className="phase-name">{phase.name}</span>
                  <span className="phase-duration">{phase.duration}min</span>
                  <div className={`energy-indicator energy-${phase.energyLevel}`} />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};