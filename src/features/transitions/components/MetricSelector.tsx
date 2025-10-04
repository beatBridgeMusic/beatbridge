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
  onDirectionChange,
}) => {
  const getDirectionLabel = (
    metric: OrderingMetric | null,
    direction: 'asc' | 'desc'
  ) => {
    if (!metric) return direction === 'asc' ? 'Low to High' : 'High to Low';

    const directionLabels = {
      tempo: { asc: 'Slow to Fast', desc: 'Fast to Slow' },
      energy: { asc: 'Calm to Energetic', desc: 'Energetic to Calm' },
      valence: { asc: 'Sad to Happy', desc: 'Happy to Sad' },
      danceability: { asc: 'Chill to Dance', desc: 'Dance to Chill' },
      loudness: { asc: 'Quiet to Loud', desc: 'Loud to Quiet' },
      popularity: { asc: 'Hidden Gems to Hits', desc: 'Hits to Hidden Gems' },
    };

    return directionLabels[metric][direction];
  };

  return (
    <div className='metric-selector'>
      {/* ✅ UPDATED: Removed redundant h3 heading since step card has title */}
      {/* 🟢 SIMPLIFIED: Just description text now, no duplicate heading */}
      <p className='step-description mt-4'>
        Pick how you want your songs ordered for the perfect transition
      </p>

      <div className='metric-selection flex items-center gap-2 mt-2'>
        <label htmlFor='metric-dropdown'>Order by:</label>
        <select
          id='metric-dropdown'
          value={selectedMetric || ''}
          onChange={(e) => onMetricChange(e.target.value as OrderingMetric)}
          className='metric-dropdown mt-2'
        >
          <option value=''>Select a metric...</option>
          {ORDERING_METRICS.map((metric) => (
            <option key={metric.value} value={metric.value}>
              {metric.label}
            </option>
          ))}
        </select>
      </div>

      {selectedMetric && (
        <div className='metric-details'>
          <div className='metric-description'>
            <p>
              {
                ORDERING_METRICS.find((m) => m.value === selectedMetric)
                  ?.description
              }
            </p>
          </div>

          <div className='direction-selection'>
            <label>Direction:</label>
            <div className='direction-options flex items-center gap-6 mt-2'>
              <label className='flex items-center gap-2 cursor-pointer'>
                <input
                  type='radio'
                  name='direction'
                  value='asc'
                  checked={orderDirection === 'asc'}
                  onChange={() => onDirectionChange('asc')}
                />
                <span className='direction-label'>
                  {getDirectionLabel(selectedMetric, 'asc')}
                </span>
              </label>

              <label className='flex items-center gap-2 cursor-pointer'>
                <input
                  type='radio'
                  name='direction'
                  value='desc'
                  checked={orderDirection === 'desc'}
                  onChange={() => onDirectionChange('desc')}
                />
                <span className='direction-label'>
                  {getDirectionLabel(selectedMetric, 'desc')}
                </span>
              </label>
            </div>
          </div>
        </div>
      )}

      {!selectedMetric && (
        <div className='metric-preview mt-2'>
          <h4>Available Metrics:</h4>
          <div className='metrics-grid space-y-4'>
            {ORDERING_METRICS.map((metric) => (
              <div
                key={metric.value}
                className='metric-card cursor-pointer hover:bg-white/5 transition-colors rounded-md p-2'
                onClick={() => onMetricChange(metric.value)}
              >
                <h5 className='text-white font-semibold mb-1 '>
                  {metric.label}
                </h5>
                <p className='text-gray-300 text-sm leading-sung'>
                  {metric.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
