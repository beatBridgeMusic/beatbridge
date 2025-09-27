// src/features/transitions/components/MetricSelector.tsx
import React from 'react';
import type { OrderingMetric } from '../types';
import { ORDERING_METRICS } from '../constants';

interface MetricSelectorProps {
  selectedMetric: OrderingMetric | null;
  onMetricChange: (metric: OrderingMetric) => void;
  orderDirection: 'asc' | 'desc';
  onDirectionChange: (direction: 'asc' | 'desc') => void;
}

export const MetricSelector: React.FC<MetricSelectorProps> = ({
  selectedMetric,
  onMetricChange,
  orderDirection,
  onDirectionChange
}) => {
  const getDirectionLabel = (metric: OrderingMetric | null, direction: 'asc' | 'desc') => {
    if (!metric) return direction === 'asc' ? 'Low to High' : 'High to Low';
    
    const directionLabels = {
      tempo: { asc: 'Slow to Fast', desc: 'Fast to Slow' },
      energy: { asc: 'Calm to Energetic', desc: 'Energetic to Calm' },
      valence: { asc: 'Sad to Happy', desc: 'Happy to Sad' },
      danceability: { asc: 'Chill to Dance', desc: 'Dance to Chill' },
      loudness: { asc: 'Quiet to Loud', desc: 'Loud to Quiet' },
      popularity: { asc: 'Hidden Gems to Hits', desc: 'Hits to Hidden Gems' }
    };
    
    return directionLabels[metric][direction];
  };

  return (
    <div className="metric-selector">
      <h3>Choose Your Flow</h3>
      <p>Pick how you want your songs ordered for the perfect transition</p>
      
      <div className="metric-selection">
        <label htmlFor="metric-dropdown">Order by:</label>
        <select 
          id="metric-dropdown"
          value={selectedMetric || ''} 
          onChange={(e) => onMetricChange(e.target.value as OrderingMetric)}
          className="metric-dropdown"
        >
          <option value="">Select a metric...</option>
          {ORDERING_METRICS.map(metric => (
            <option key={metric.value} value={metric.value}>
              {metric.label}
            </option>
          ))}
        </select>
      </div>

      {selectedMetric && (
        <div className="metric-details">
          <div className="metric-description">
            <p>{ORDERING_METRICS.find(m => m.value === selectedMetric)?.description}</p>
          </div>
          
          <div className="direction-selection">
            <label>Direction:</label>
            <div className="direction-options">
              <label className="direction-option">
                <input
                  type="radio"
                  name="direction"
                  value="asc"
                  checked={orderDirection === 'asc'}
                  onChange={() => onDirectionChange('asc')}
                />
                <span className="direction-label">
                  {getDirectionLabel(selectedMetric, 'asc')}
                </span>
              </label>
              
              <label className="direction-option">
                <input
                  type="radio"
                  name="direction"
                  value="desc"
                  checked={orderDirection === 'desc'}
                  onChange={() => onDirectionChange('desc')}
                />
                <span className="direction-label">
                  {getDirectionLabel(selectedMetric, 'desc')}
                </span>
              </label>
            </div>
          </div>
        </div>
      )}

      {!selectedMetric && (
        <div className="metric-preview">
          <h4>Available Metrics:</h4>
          <div className="metrics-grid">
            {ORDERING_METRICS.map(metric => (
              <div 
                key={metric.value} 
                className="metric-card"
                onClick={() => onMetricChange(metric.value)}
              >
                <h5>{metric.label}</h5>
                <p>{metric.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};