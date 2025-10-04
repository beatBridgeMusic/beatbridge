/// src/features/transitions/components/OrderedPlaylist.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { OrderedPlaylist } from './OrderedPlaylist';
import { mockSongs } from '../../../test/mocks/songData';
import type { OrderedPlaylist as OrderedPlaylistType } from '../types';

describe('OrderedPlaylist', () => {
  const mockOnCreateNew = vi.fn();

  const mockPlaylist: OrderedPlaylistType = {
    id: 'playlist-123',
    songs: mockSongs,
    orderingMetric: 'energy',
    totalDuration: 12,
    createdAt: new Date('2024-01-01'),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Loading State', () => {
    it('shows generating message when isGenerating is true', () => {
      render(
        <OrderedPlaylist 
          playlist={null} 
          isGenerating={true} 
          onCreateNew={mockOnCreateNew} 
        />
      );

      expect(screen.getByText(/creating your beat bridge/i)).toBeInTheDocument();
      expect(screen.getByText(/analyzing your songs/i)).toBeInTheDocument();
    });

    it('displays animated loading bars', () => {
      const { container } = render(
        <OrderedPlaylist 
          playlist={null} 
          isGenerating={true} 
          onCreateNew={mockOnCreateNew} 
        />
      );

      const loadingBars = container.querySelectorAll('.animate-pulse');
      expect(loadingBars.length).toBeGreaterThan(0);
    });
  });

  describe('Empty State', () => {
    it('shows empty state message when no playlist', () => {
      render(
        <OrderedPlaylist 
          playlist={null} 
          isGenerating={false} 
          onCreateNew={mockOnCreateNew} 
        />
      );

      expect(screen.getByText(/your beat bridge will appear here/i)).toBeInTheDocument();
      expect(screen.getByText(/select songs, choose a metric/i)).toBeInTheDocument();
    });

    it('does not show playlist when null', () => {
      render(
        <OrderedPlaylist 
          playlist={null} 
          isGenerating={false} 
          onCreateNew={mockOnCreateNew} 
        />
      );

      expect(screen.queryByText(/your beat bridge/i)).toBeInTheDocument();
      expect(screen.queryByText('High Energy Track')).not.toBeInTheDocument();
    });
  });

  describe('Playlist Header', () => {
    it('displays playlist title', () => {
      render(
        <OrderedPlaylist 
          playlist={mockPlaylist} 
          isGenerating={false} 
          onCreateNew={mockOnCreateNew} 
        />
      );

      expect(screen.getByText(/your beat bridge/i)).toBeInTheDocument();
    });

    it('shows correct song count', () => {
      render(
        <OrderedPlaylist 
          playlist={mockPlaylist} 
          isGenerating={false} 
          onCreateNew={mockOnCreateNew} 
        />
      );

      expect(screen.getByText('4 songs')).toBeInTheDocument();
    });

    it('shows total duration', () => {
      render(
        <OrderedPlaylist 
          playlist={mockPlaylist} 
          isGenerating={false} 
          onCreateNew={mockOnCreateNew} 
        />
      );

      expect(screen.getByText('12 minutes')).toBeInTheDocument();
    });

    it('displays ordering metric label', () => {
      render(
        <OrderedPlaylist 
          playlist={mockPlaylist} 
          isGenerating={false} 
          onCreateNew={mockOnCreateNew} 
        />
      );

      expect(screen.getByText(/ordered by energy/i)).toBeInTheDocument();
    });

    it('shows correct metric label for tempo', () => {
      const tempoPlaylist = { ...mockPlaylist, orderingMetric: 'tempo' as const };
      render(
        <OrderedPlaylist 
          playlist={tempoPlaylist} 
          isGenerating={false} 
          onCreateNew={mockOnCreateNew} 
        />
      );

      expect(screen.getByText(/ordered by tempo/i)).toBeInTheDocument();
    });
  });

  describe('Song List Rendering', () => {
    it('renders all songs in the playlist', () => {
      render(
        <OrderedPlaylist 
          playlist={mockPlaylist} 
          isGenerating={false} 
          onCreateNew={mockOnCreateNew} 
        />
      );

      expect(screen.getByText('High Energy Track')).toBeInTheDocument();
      expect(screen.getByText('Medium Energy Track')).toBeInTheDocument();
      expect(screen.getByText('Low Energy Track')).toBeInTheDocument();
      expect(screen.getByText('Fast Track')).toBeInTheDocument();
    });

    it('displays song numbers correctly', () => {
      render(
        <OrderedPlaylist 
          playlist={mockPlaylist} 
          isGenerating={false} 
          onCreateNew={mockOnCreateNew} 
        />
      );

      expect(screen.getByText('1')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument();
      expect(screen.getByText('4')).toBeInTheDocument();
    });

    it('shows artist names', () => {
      render(
        <OrderedPlaylist 
          playlist={mockPlaylist} 
          isGenerating={false} 
          onCreateNew={mockOnCreateNew} 
        />
      );

      expect(screen.getByText('Artist One')).toBeInTheDocument();
      expect(screen.getByText('Artist Two')).toBeInTheDocument();
    });

    it('displays song durations', () => {
      render(
        <OrderedPlaylist 
          playlist={mockPlaylist} 
          isGenerating={false} 
          onCreateNew={mockOnCreateNew} 
        />
      );

      // mockSongs[0] has 180000ms = 3:00
      expect(screen.getByText('3:00')).toBeInTheDocument();
    });

    it('shows genres for each song', () => {
      render(
        <OrderedPlaylist 
          playlist={mockPlaylist} 
          isGenerating={false} 
          onCreateNew={mockOnCreateNew} 
        />
      );

      expect(screen.getByText('pop, electronic')).toBeInTheDocument();
      expect(screen.getByText('indie, alternative')).toBeInTheDocument();
    });

    it('displays explicit badge for explicit songs', () => {
      render(
        <OrderedPlaylist 
          playlist={mockPlaylist} 
          isGenerating={false} 
          onCreateNew={mockOnCreateNew} 
        />
      );

      // mockSongs[2] is explicit
      const explicitBadges = screen.getAllByText('🅴');
      expect(explicitBadges.length).toBeGreaterThan(0);
    });

    it('shows flow arrows between songs', () => {
      const { container } = render(
        <OrderedPlaylist 
          playlist={mockPlaylist} 
          isGenerating={false} 
          onCreateNew={mockOnCreateNew} 
        />
      );

      // Should have 3 arrows for 4 songs (no arrow after last song)
      const arrows = Array.from(container.querySelectorAll('div')).filter(
        el => el.textContent === '↓'
      );
      expect(arrows.length).toBe(3);
    });
  });

  describe('Metric Value Display', () => {
    it('formats tempo values correctly', () => {
      const tempoPlaylist = { ...mockPlaylist, orderingMetric: 'tempo' as const };
      render(
        <OrderedPlaylist 
          playlist={tempoPlaylist} 
          isGenerating={false} 
          onCreateNew={mockOnCreateNew} 
        />
      );

      // mockSongs[0] has tempo 140
      expect(screen.getByText('140 BPM')).toBeInTheDocument();
    });

    it('formats energy values as percentages', () => {
      const energyPlaylist = { ...mockPlaylist, orderingMetric: 'energy' as const };
      render(
        <OrderedPlaylist 
          playlist={energyPlaylist} 
          isGenerating={false} 
          onCreateNew={mockOnCreateNew} 
        />
      );

      // mockSongs[0] has energy 0.9 = 90%
      expect(screen.getByText('90%')).toBeInTheDocument();
    });

    it('formats valence values as percentages', () => {
      const valencePlaylist = { ...mockPlaylist, orderingMetric: 'valence' as const };
      render(
        <OrderedPlaylist 
          playlist={valencePlaylist} 
          isGenerating={false} 
          onCreateNew={mockOnCreateNew} 
        />
      );

      // mockSongs[0] has valence 0.8 = 80%
      expect(screen.getByText('80%')).toBeInTheDocument();
    });

    it('formats danceability values as percentages', () => {
      const dancePlaylist = { ...mockPlaylist, orderingMetric: 'danceability' as const };
      render(
        <OrderedPlaylist 
          playlist={dancePlaylist} 
          isGenerating={false} 
          onCreateNew={mockOnCreateNew} 
        />
      );

      // mockSongs[0] has danceability 0.85 = 85%
      expect(screen.getByText('85%')).toBeInTheDocument();
    });

    it('formats loudness values with decimal', () => {
      const loudnessPlaylist = { ...mockPlaylist, orderingMetric: 'loudness' as const };
      render(
        <OrderedPlaylist 
          playlist={loudnessPlaylist} 
          isGenerating={false} 
          onCreateNew={mockOnCreateNew} 
        />
      );

      // mockSongs[0] has loudness -5.0
      expect(screen.getByText('-5.0 dB')).toBeInTheDocument();
    });

    it('formats popularity values correctly', () => {
      const popPlaylist = { ...mockPlaylist, orderingMetric: 'popularity' as const };
      render(
        <OrderedPlaylist 
          playlist={popPlaylist} 
          isGenerating={false} 
          onCreateNew={mockOnCreateNew} 
        />
      );

      // mockSongs[0] has popularity 80
      expect(screen.getByText('80/100')).toBeInTheDocument();
    });
  });

  describe('Action Buttons', () => {
    it('renders create another button', () => {
      render(
        <OrderedPlaylist 
          playlist={mockPlaylist} 
          isGenerating={false} 
          onCreateNew={mockOnCreateNew} 
        />
      );

      expect(screen.getByText(/create another beat bridge/i)).toBeInTheDocument();
    });

    it('calls onCreateNew when create another is clicked', async () => {
      const user = userEvent.setup();
      render(
        <OrderedPlaylist 
          playlist={mockPlaylist} 
          isGenerating={false} 
          onCreateNew={mockOnCreateNew} 
        />
      );

      await user.click(screen.getByText(/create another beat bridge/i));

      expect(mockOnCreateNew).toHaveBeenCalledTimes(1);
    });

    it('shows disabled export button', () => {
      render(
        <OrderedPlaylist 
          playlist={mockPlaylist} 
          isGenerating={false} 
          onCreateNew={mockOnCreateNew} 
        />
      );

      const exportButton = screen.getByText('Export Playlist');
      expect(exportButton).toBeDisabled();
    });

    it('shows disabled share button', () => {
      render(
        <OrderedPlaylist 
          playlist={mockPlaylist} 
          isGenerating={false} 
          onCreateNew={mockOnCreateNew} 
        />
      );

      const shareButton = screen.getByText('Share Beat Bridge');
      expect(shareButton).toBeDisabled();
    });

    it('displays coming soon message', () => {
      render(
        <OrderedPlaylist 
          playlist={mockPlaylist} 
          isGenerating={false} 
          onCreateNew={mockOnCreateNew} 
        />
      );

      expect(screen.getByText(/export and share features coming soon/i)).toBeInTheDocument();
    });
  });

  describe('Flow Analysis', () => {
    it('displays flow analysis section', () => {
      render(
        <OrderedPlaylist 
          playlist={mockPlaylist} 
          isGenerating={false} 
          onCreateNew={mockOnCreateNew} 
        />
      );

      expect(screen.getByText('Flow Analysis')).toBeInTheDocument();
    });

    it('calculates and displays average energy correctly', () => {
      const energyPlaylist = { ...mockPlaylist, orderingMetric: 'energy' as const };
      render(
        <OrderedPlaylist 
          playlist={energyPlaylist} 
          isGenerating={false} 
          onCreateNew={mockOnCreateNew} 
        />
      );

      expect(screen.getByText(/avg energy/i)).toBeInTheDocument();
      // Average of 0.9, 0.6, 0.3, 0.95 = 0.6875 = 69%
      expect(screen.getByText('69%')).toBeInTheDocument();
    });

    it('calculates average tempo correctly', () => {
      const tempoPlaylist = { ...mockPlaylist, orderingMetric: 'tempo' as const };
      render(
        <OrderedPlaylist 
          playlist={tempoPlaylist} 
          isGenerating={false} 
          onCreateNew={mockOnCreateNew} 
        />
      );

      // Average of 140, 120, 90, 180 = 132.5 = 133 BPM
      expect(screen.getByText('133 BPM')).toBeInTheDocument();
    });

    it('shows ascending flow direction when values increase', () => {
      // Create playlist with ascending order
      const ascendingPlaylist = {
        ...mockPlaylist,
        songs: [mockSongs[2], mockSongs[1], mockSongs[0], mockSongs[3]], // 0.3, 0.6, 0.9, 0.95
      };
      
      render(
        <OrderedPlaylist 
          playlist={ascendingPlaylist} 
          isGenerating={false} 
          onCreateNew={mockOnCreateNew} 
        />
      );

      expect(screen.getByText('Ascending ↗')).toBeInTheDocument();
    });

    it('shows descending flow direction when values decrease', () => {
      // Create playlist with descending order
      const descendingPlaylist = {
        ...mockPlaylist,
        songs: [mockSongs[3], mockSongs[0], mockSongs[1], mockSongs[2]], // 0.95, 0.9, 0.6, 0.3
      };
      
      render(
        <OrderedPlaylist 
          playlist={descendingPlaylist} 
          isGenerating={false} 
          onCreateNew={mockOnCreateNew} 
        />
      );

      expect(screen.getByText('Descending ↘')).toBeInTheDocument();
    });

    it('shows N/A for flow direction with less than 2 songs', () => {
      const singleSongPlaylist = {
        ...mockPlaylist,
        songs: [mockSongs[0]],
      };
      
      render(
        <OrderedPlaylist 
          playlist={singleSongPlaylist} 
          isGenerating={false} 
          onCreateNew={mockOnCreateNew} 
        />
      );

      expect(screen.getByText('N/A')).toBeInTheDocument();
    });

    it('displays unique genres', () => {
      render(
        <OrderedPlaylist 
          playlist={mockPlaylist} 
          isGenerating={false} 
          onCreateNew={mockOnCreateNew} 
        />
      );

      // Should show genre information
      const genreSection = screen.getByText('Genres').parentElement;
      expect(genreSection).toBeInTheDocument();
    });

    it('truncates genre list when more than 3', () => {
      const manyGenresPlaylist = {
        ...mockPlaylist,
        songs: [
          { ...mockSongs[0], genres: 'pop' },
          { ...mockSongs[1], genres: 'rock' },
          { ...mockSongs[2], genres: 'jazz' },
          { ...mockSongs[3], genres: 'electronic' },
        ],
      };
      
      render(
        <OrderedPlaylist 
          playlist={manyGenresPlaylist} 
          isGenerating={false} 
          onCreateNew={mockOnCreateNew} 
        />
      );

      // Should show "+2" for 4 genres (showing 2 + 2 more)
      expect(screen.getByText(/\+2/)).toBeInTheDocument();
    });

    it('shows all genres when 3 or fewer', () => {
      const fewGenresPlaylist = {
        ...mockPlaylist,
        songs: [
          { ...mockSongs[0], genres: 'pop' },
          { ...mockSongs[1], genres: 'rock' },
          { ...mockSongs[2], genres: 'pop' }, // duplicate
        ],
      };
      
      render(
        <OrderedPlaylist 
          playlist={fewGenresPlaylist} 
          isGenerating={false} 
          onCreateNew={mockOnCreateNew} 
        />
      );

      // Should show "pop, rock" (2 unique genres)
      const genresText = screen.getByText('Genres').parentElement?.textContent;
      expect(genresText).toContain('pop');
      expect(genresText).toContain('rock');
    });
  });

  describe('Edge Cases', () => {
    it('handles empty songs array', () => {
      const emptyPlaylist = {
        ...mockPlaylist,
        songs: [],
      };
      
      render(
        <OrderedPlaylist 
          playlist={emptyPlaylist} 
          isGenerating={false} 
          onCreateNew={mockOnCreateNew} 
        />
      );

      expect(screen.getByText('0 songs')).toBeInTheDocument();
    });

    it('formats duration with leading zero for seconds', () => {
      const shortSongPlaylist = {
        ...mockPlaylist,
        songs: [{
          ...mockSongs[0],
          duration_ms: 125000, // 2 minutes 5 seconds
        }],
      };
      
      render(
        <OrderedPlaylist 
          playlist={shortSongPlaylist} 
          isGenerating={false} 
          onCreateNew={mockOnCreateNew} 
        />
      );

      expect(screen.getByText('2:05')).toBeInTheDocument();
    });

    it('handles songs without explicit flag', () => {
      const cleanPlaylist = {
        ...mockPlaylist,
        songs: [{ ...mockSongs[0], explicit: false }],
      };
      
      render(
        <OrderedPlaylist 
          playlist={cleanPlaylist} 
          isGenerating={false} 
          onCreateNew={mockOnCreateNew} 
        />
      );

      // Should not show explicit badge
      expect(screen.queryByText('🅴')).not.toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('uses semantic heading levels', () => {
      render(
        <OrderedPlaylist 
          playlist={mockPlaylist} 
          isGenerating={false} 
          onCreateNew={mockOnCreateNew} 
        />
      );

      expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 4 })).toBeInTheDocument();
    });

    it('buttons are keyboard accessible', async () => {
      const user = userEvent.setup();
      render(
        <OrderedPlaylist 
          playlist={mockPlaylist} 
          isGenerating={false} 
          onCreateNew={mockOnCreateNew} 
        />
      );

      const createButton = screen.getByText(/create another beat bridge/i);
      createButton.focus();
      
      expect(createButton).toHaveFocus();
      
      await user.keyboard('{Enter}');
      expect(mockOnCreateNew).toHaveBeenCalled();
    });
  });
});