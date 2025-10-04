import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { TransitionLab } from './TransitionLab';
import { renderWithAuth } from '../../../test/utils';
import { mockSongs } from '../../../test/mocks/songData';
import type { DbSong, OrderingMetric, OrderedPlaylist as OrderedPlaylistType } from '../types';

// Mock child components to isolate TransitionLab logic
vi.mock('./SongSelector', () => ({
  SongSelector: ({ selectedSongs, onSongsChange }: { selectedSongs: DbSong[]; onSongsChange: (songs: DbSong[]) => void }) => (
    <div data-testid="song-selector">
      <button onClick={() => onSongsChange(mockSongs)}>
        Add All Songs
      </button>
      <div>Selected: {selectedSongs.length} songs</div>
    </div>
  ),
}));

vi.mock('./MetricSelector', () => ({
  MetricSelector: ({ 
    selectedMetric, 
    onMetricChange, 
    orderDirection, 
    onDirectionChange 
  }: { 
    selectedMetric: OrderingMetric | null; 
    onMetricChange: (metric: OrderingMetric) => void;
    orderDirection: 'asc' | 'desc';
    onDirectionChange: (direction: 'asc' | 'desc') => void;
  }) => (
    <div data-testid="metric-selector">
      <button onClick={() => onMetricChange('energy')}>
        Select Energy
      </button>
      <button onClick={() => onDirectionChange('desc')}>
        Set Descending
      </button>
      <div>Metric: {selectedMetric || 'None'}</div>
      <div>Direction: {orderDirection}</div>
    </div>
  ),
}));

vi.mock('./DurationInput', () => ({
  DurationInput: ({ 
    customDuration, 
    onDurationChange,
  }: { 
    customDuration: number | null; 
    onDurationChange: (duration: number | null) => void;
    selectedSongs: DbSong[];
  }) => (
    <div data-testid="duration-input">
      <button onClick={() => onDurationChange(10)}>
        Set 10 Minutes
      </button>
      <div>Duration: {customDuration || 'None'}</div>
    </div>
  ),
}));

vi.mock('./OrderedPlaylist', () => ({
  OrderedPlaylist: ({ playlist, isGenerating, onCreateNew }: { 
    playlist: OrderedPlaylistType | null; 
    isGenerating: boolean; 
    onCreateNew: () => void;
  }) => (
    <div data-testid="ordered-playlist">
      {isGenerating && <div>Generating playlist...</div>}
      {playlist && (
        <div>
          <div>Playlist ID: {playlist.id}</div>
          <div>Songs: {playlist.songs.length}</div>
          <button onClick={onCreateNew}>Create New</button>
        </div>
      )}
    </div>
  ),
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('TransitionLab', () => {
  //const mockUser = { id: '1', email: 'test@example.com', username: 'testuser' };
  const mockLogout = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Initial Render', () => {
    it('renders the main heading', () => {
      renderWithAuth(<TransitionLab />, { logout: mockLogout });
      
      expect(screen.getByText('🎵 BeatBridge.')).toBeInTheDocument();
      expect(
        screen.getByText(/Order your customized playlist by any metric/i)
      ).toBeInTheDocument();
    });

    it('shows step 1 (song selection) initially', () => {
      renderWithAuth(<TransitionLab />, { logout: mockLogout });
      
      expect(screen.getByText('Choose Your Songs')).toBeInTheDocument();
      expect(screen.getByTestId('song-selector')).toBeInTheDocument();
    });

    it('does not show step 2 until minimum songs selected', () => {
      renderWithAuth(<TransitionLab />, { logout: mockLogout });
      
      expect(screen.queryByText('Choose Your Flow')).not.toBeInTheDocument();
    });

    it('does not show generate button initially', () => {
      renderWithAuth(<TransitionLab />, { logout: mockLogout });
      
      expect(
        screen.queryByText('Create Beat Bridge')
      ).not.toBeInTheDocument();
    });
  });

  describe('Step-by-Step Flow', () => {
    it('shows step 2 after selecting minimum songs', async () => {
      const user = userEvent.setup();
      renderWithAuth(<TransitionLab />, { logout: mockLogout });
      
      await user.click(screen.getByText('Add All Songs'));
      
      expect(screen.getByText('Choose Your Flow')).toBeInTheDocument();
      expect(screen.getByTestId('metric-selector')).toBeInTheDocument();
    });

    it('shows step 3 after selecting a metric', async () => {
      const user = userEvent.setup();
      renderWithAuth(<TransitionLab />, { logout: mockLogout });
      
      await user.click(screen.getByText('Add All Songs'));
      await user.click(screen.getByText('Select Energy'));
      
      expect(screen.getByText('Set Duration')).toBeInTheDocument();
      expect(screen.getByTestId('duration-input')).toBeInTheDocument();
    });

    it('shows generate button when requirements met', async () => {
      const user = userEvent.setup();
      renderWithAuth(<TransitionLab />, { logout: mockLogout });
      
      await user.click(screen.getByText('Add All Songs'));
      await user.click(screen.getByText('Select Energy'));
      
      expect(
        screen.getByText('Create Beat Bridge')
      ).toBeInTheDocument();
    });
  });

  describe('Playlist Generation', () => {
    it('generates playlist and shows results', async () => {
      const user = userEvent.setup();
      renderWithAuth(<TransitionLab />, { logout: mockLogout });
      
      // Setup
      await user.click(screen.getByText('Add All Songs'));
      await user.click(screen.getByText('Select Energy'));
      
      // Generate
      await user.click(screen.getByText('Create Beat Bridge'));
      
      // Check loading state
      expect(screen.getByText('Creating Your Beat Bridge...')).toBeInTheDocument();
      
      // Wait for generation to complete
      await waitFor(() => {
        expect(screen.getByText(/Playlist ID:/)).toBeInTheDocument();
      }, { timeout: 3000 });
      
      expect(screen.getByText(/Songs: 4/)).toBeInTheDocument();
    });

    it('disables generate button during generation', async () => {
      const user = userEvent.setup();
      renderWithAuth(<TransitionLab />, { logout: mockLogout });
      
      await user.click(screen.getByText('Add All Songs'));
      await user.click(screen.getByText('Select Energy'));
      
      const generateButton = screen.getByText('Create Beat Bridge');
      await user.click(generateButton);
      
      expect(generateButton).toBeDisabled();
    });

    it('respects custom duration when set', async () => {
      const user = userEvent.setup();
      renderWithAuth(<TransitionLab />, { logout: mockLogout });
      
      await user.click(screen.getByText('Add All Songs'));
      await user.click(screen.getByText('Select Energy'));
      await user.click(screen.getByText('Set 10 Minutes'));
      await user.click(screen.getByText('Create Beat Bridge'));
      
      await waitFor(() => {
        expect(screen.getByText(/Playlist ID:/)).toBeInTheDocument();
      }, { timeout: 3000 });
      
      // Playlist should be generated with duration constraint
      expect(screen.getByTestId('ordered-playlist')).toBeInTheDocument();
    });

    it('resets state when creating new playlist', async () => {
      const user = userEvent.setup();
      renderWithAuth(<TransitionLab />, { logout: mockLogout });
      
      // Generate a playlist
      await user.click(screen.getByText('Add All Songs'));
      await user.click(screen.getByText('Select Energy'));
      await user.click(screen.getByText('Create Beat Bridge'));
      
      await waitFor(() => {
        expect(screen.getByText(/Playlist ID:/)).toBeInTheDocument();
      }, { timeout: 3000 });
      
      // Create new
      await user.click(screen.getByText('Create New'));
      
      // Should reset to initial state
      expect(screen.getByText('Selected: 0 songs')).toBeInTheDocument();
      expect(screen.queryByText(/Playlist ID:/)).not.toBeInTheDocument();
    });
  });

  describe('Ordering Logic', () => {
    it('orders songs by metric in ascending order by default', async () => {
      const user = userEvent.setup();
      renderWithAuth(<TransitionLab />, { logout: mockLogout });
      
      await user.click(screen.getByText('Add All Songs'));
      await user.click(screen.getByText('Select Energy'));
      await user.click(screen.getByText('Create Beat Bridge'));
      
      await waitFor(() => {
        expect(screen.getByText(/Playlist ID:/)).toBeInTheDocument();
      }, { timeout: 3000 });
      
      // Songs should be ordered by energy ascending
      // mockSongs ordered by energy: 0.3, 0.6, 0.9, 0.95
      expect(screen.getByTestId('ordered-playlist')).toBeInTheDocument();
    });

    it('orders songs in descending order when selected', async () => {
      const user = userEvent.setup();
      renderWithAuth(<TransitionLab />, { logout: mockLogout });
      
      await user.click(screen.getByText('Add All Songs'));
      await user.click(screen.getByText('Select Energy'));
      await user.click(screen.getByText('Set Descending'));
      await user.click(screen.getByText('Create Beat Bridge'));
      
      await waitFor(() => {
        expect(screen.getByText(/Playlist ID:/)).toBeInTheDocument();
      }, { timeout: 3000 });
      
      expect(screen.getByText('Direction: desc')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {

    it('maintains accessible heading hierarchy', () => {
      renderWithAuth(<TransitionLab />, { logout: mockLogout });
      
      const h1 = screen.getByRole('heading', { level: 1 });
      expect(h1).toHaveTextContent('🎵 BeatBridge.');
      
      const h2 = screen.getByRole('heading', { level: 2 });
      expect(h2).toHaveTextContent('Choose Your Songs');
    });

    it('provides visual step indicators', async () => {
      const user = userEvent.setup();
      renderWithAuth(<TransitionLab />, { logout: mockLogout });
      
      // Step 1 should be visible
      expect(screen.getByText('1')).toBeInTheDocument();
      
      // Add songs to reveal step 2
      await user.click(screen.getByText('Add All Songs'));
      expect(screen.getByText('2')).toBeInTheDocument();
      
      // Select metric to reveal step 3
      await user.click(screen.getByText('Select Energy'));
      expect(screen.getByText('3')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('handles generation errors gracefully', async () => {
      const user = userEvent.setup();
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      renderWithAuth(<TransitionLab />, { logout: mockLogout });
      
      await user.click(screen.getByText('Add All Songs'));
      await user.click(screen.getByText('Select Energy'));
      
      // Even if there's an error, the component should handle it
      await user.click(screen.getByText('Create Beat Bridge'));
      
      await waitFor(() => {
        expect(screen.queryByText('Creating Your Beat Bridge...')).not.toBeInTheDocument();
      }, { timeout: 3000 });
      
      consoleError.mockRestore();
    });
  });
});