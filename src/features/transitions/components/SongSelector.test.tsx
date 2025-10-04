// src/features/transitions/components/SongSelector.test.tsx
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SongSelector } from './SongSelector';
import { mockSongs } from '../../../test/mocks/songData';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('SongSelector', () => {
  const mockOnSongsChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    // Default successful fetch response
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => mockSongs,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Initial Render and Loading', () => {
    it('shows loading state initially', () => {
      render(<SongSelector selectedSongs={[]} onSongsChange={mockOnSongsChange} />);
      
      expect(screen.getByText(/loading songs/i)).toBeInTheDocument();
    });

    it('fetches songs from API on mount', async () => {
      render(<SongSelector selectedSongs={[]} onSongsChange={mockOnSongsChange} />);
      
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith('http://localhost:3001/songs/all');
      });
    });

    it('displays songs after successful fetch', async () => {
      render(<SongSelector selectedSongs={[]} onSongsChange={mockOnSongsChange} />);
      
      await waitFor(() => {
        expect(screen.queryByText(/loading songs/i)).not.toBeInTheDocument();
      });

      expect(screen.getByText(/select/i)).toBeInTheDocument();
      expect(screen.getByText(/3/)).toBeInTheDocument();
      expect(screen.getByText(/20/)).toBeInTheDocument();
    });

    it('handles fetch errors gracefully', async () => {
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
      mockFetch.mockRejectedValue(new Error('Network error'));
      
      render(<SongSelector selectedSongs={[]} onSongsChange={mockOnSongsChange} />);
      
      await waitFor(() => {
        expect(screen.queryByText(/loading songs/i)).not.toBeInTheDocument();
      });

      expect(consoleError).toHaveBeenCalled();
      consoleError.mockRestore();
    });

    it('handles non-ok response from server', async () => {
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
      mockFetch.mockResolvedValue({
        ok: false,
        status: 500,
      });
      
      render(<SongSelector selectedSongs={[]} onSongsChange={mockOnSongsChange} />);
      
      await waitFor(() => {
        expect(consoleError).toHaveBeenCalled();
      });

      consoleError.mockRestore();
    });
  });

  describe('Song Dropdown', () => {
    it('shows dropdown toggle button', async () => {
      render(<SongSelector selectedSongs={[]} onSongsChange={mockOnSongsChange} />);
      
      await waitFor(() => {
        expect(screen.getByText(/add songs/i)).toBeInTheDocument();
      });
    });

    it('opens dropdown when toggle button is clicked', async () => {
      const user = userEvent.setup();
      render(<SongSelector selectedSongs={[]} onSongsChange={mockOnSongsChange} />);
      
      await waitFor(() => {
        expect(screen.getByText(/add songs/i)).toBeInTheDocument();
      });

      await user.click(screen.getByText(/add songs/i));

      expect(screen.getByPlaceholderText(/search songs or artists/i)).toBeInTheDocument();
    });

    it('closes dropdown when toggle button is clicked again', async () => {
      const user = userEvent.setup();
      render(<SongSelector selectedSongs={[]} onSongsChange={mockOnSongsChange} />);
      
      await waitFor(() => {
        expect(screen.getByText(/add songs/i)).toBeInTheDocument();
      });

      const toggleButton = screen.getByText(/add songs/i);
      
      await user.click(toggleButton);
      expect(screen.getByPlaceholderText(/search songs or artists/i)).toBeInTheDocument();
      
      await user.click(toggleButton);
      expect(screen.queryByPlaceholderText(/search songs or artists/i)).not.toBeInTheDocument();
    });

    it('displays correct count of available songs', async () => {
      render(<SongSelector selectedSongs={[]} onSongsChange={mockOnSongsChange} />);
      
      await waitFor(() => {
        expect(screen.getByText(/add songs \(4 available\)/i)).toBeInTheDocument();
      });
    });
  });

  describe('Search Functionality', () => {
    it('filters songs by track name', async () => {
      const user = userEvent.setup();
      render(<SongSelector selectedSongs={[]} onSongsChange={mockOnSongsChange} />);
      
      await waitFor(() => {
        expect(screen.getByText(/add songs/i)).toBeInTheDocument();
      });

      await user.click(screen.getByText(/add songs/i));
      
      const searchInput = screen.getByPlaceholderText(/search songs or artists/i);
      await user.type(searchInput, 'High Energy');

      expect(screen.getByText('High Energy Track')).toBeInTheDocument();
      expect(screen.queryByText('Medium Energy Track')).not.toBeInTheDocument();
    });

    it('filters songs by artist name', async () => {
      const user = userEvent.setup();
      render(<SongSelector selectedSongs={[]} onSongsChange={mockOnSongsChange} />);
      
      await waitFor(() => {
        expect(screen.getByText(/add songs/i)).toBeInTheDocument();
      });

      await user.click(screen.getByText(/add songs/i));
      
      const searchInput = screen.getByPlaceholderText(/search songs or artists/i);
      await user.type(searchInput, 'Artist Two');

      expect(screen.getByText('Medium Energy Track')).toBeInTheDocument();
      expect(screen.queryByText('High Energy Track')).not.toBeInTheDocument();
    });

    it('is case-insensitive when searching', async () => {
      const user = userEvent.setup();
      render(<SongSelector selectedSongs={[]} onSongsChange={mockOnSongsChange} />);
      
      await waitFor(() => {
        expect(screen.getByText(/add songs/i)).toBeInTheDocument();
      });

      await user.click(screen.getByText(/add songs/i));
      
      const searchInput = screen.getByPlaceholderText(/search songs or artists/i);
      await user.type(searchInput, 'FAST TRACK');

      expect(screen.getByText('Fast Track')).toBeInTheDocument();
    });

    it('shows no results message when search has no matches', async () => {
      const user = userEvent.setup();
      render(<SongSelector selectedSongs={[]} onSongsChange={mockOnSongsChange} />);
      
      await waitFor(() => {
        expect(screen.getByText(/add songs/i)).toBeInTheDocument();
      });

      await user.click(screen.getByText(/add songs/i));
      
      const searchInput = screen.getByPlaceholderText(/search songs or artists/i);
      await user.type(searchInput, 'NonexistentSong12345');

      expect(screen.getByText(/no songs found matching your search/i)).toBeInTheDocument();
    });
  });

  describe('Sort Functionality', () => {
    it('sorts by artist name by default', async () => {
      const user = userEvent.setup();
      render(<SongSelector selectedSongs={[]} onSongsChange={mockOnSongsChange} />);
      
      await waitFor(() => {
        expect(screen.getByText(/add songs/i)).toBeInTheDocument();
      });

      await user.click(screen.getByText(/add songs/i));

      const songTitles = screen.getAllByRole('checkbox').map(cb => 
        cb.parentElement?.querySelector('.song-artist')?.textContent
      );

      // Should be sorted alphabetically by artist
      expect(songTitles[0]).toBe('Artist Four');
      expect(songTitles[1]).toBe('Artist One');
    });

    it('sorts by song title when selected', async () => {
      const user = userEvent.setup();
      render(<SongSelector selectedSongs={[]} onSongsChange={mockOnSongsChange} />);
      
      await waitFor(() => {
        expect(screen.getByText(/add songs/i)).toBeInTheDocument();
      });

      await user.click(screen.getByText(/add songs/i));
      
      const sortSelect = screen.getByRole('combobox');
      await user.selectOptions(sortSelect, 'title');

      const songTitles = screen.getAllByRole('checkbox').map(cb => 
        cb.parentElement?.querySelector('.song-title')?.textContent
      );

      // Should be sorted alphabetically by title
      expect(songTitles[0]).toBe('Fast Track');
      expect(songTitles[1]).toBe('High Energy Track');
    });
  });

  describe('Song Selection', () => {
    it('adds song when checkbox is clicked', async () => {
      const user = userEvent.setup();
      render(<SongSelector selectedSongs={[]} onSongsChange={mockOnSongsChange} />);
      
      await waitFor(() => {
        expect(screen.getByText(/add songs/i)).toBeInTheDocument();
      });

      await user.click(screen.getByText(/add songs/i));
      
      const firstCheckbox = screen.getAllByRole('checkbox')[0];
      await user.click(firstCheckbox);

      expect(mockOnSongsChange).toHaveBeenCalledWith([mockSongs[3]]); // Artist Four (sorted first)
    });

    it('removes song when checkbox is unchecked', async () => {
      const user = userEvent.setup();
      render(
        <SongSelector 
          selectedSongs={[mockSongs[0]]} 
          onSongsChange={mockOnSongsChange} 
        />
      );
      
      await waitFor(() => {
        expect(screen.getByText(/add songs/i)).toBeInTheDocument();
      });

      await user.click(screen.getByText(/add songs/i));
      
      // Find the checkbox for the selected song
      const checkbox = screen.getAllByRole('checkbox').find(cb => (cb as HTMLInputElement).checked);
      await user.click(checkbox!);

      expect(mockOnSongsChange).toHaveBeenCalledWith([]);
    });

    it('displays selected songs count', async () => {
      render(
        <SongSelector 
          selectedSongs={[mockSongs[0], mockSongs[1]]} 
          onSongsChange={mockOnSongsChange} 
        />
      );
      
      await waitFor(() => {
        expect(screen.getByText(/selected songs/i)).toBeInTheDocument();
});

        // Check for the numbers separately since they're split across elements
        const heading = screen.getByRole('heading', { level: 4 });
        expect(heading.textContent).toContain('2');
        expect(heading.textContent).toContain('20');
    });

    it('shows selected songs with remove buttons', async () => {
      render(
        <SongSelector 
          selectedSongs={[mockSongs[0]]} 
          onSongsChange={mockOnSongsChange} 
        />
      );
      
      await waitFor(() => {
        expect(screen.getByText('High Energy Track - Artist One')).toBeInTheDocument();
      });

      expect(screen.getByText('✕')).toBeInTheDocument();
    });

    it('removes song when X button is clicked', async () => {
      const user = userEvent.setup();
      render(
        <SongSelector 
          selectedSongs={[mockSongs[0]]} 
          onSongsChange={mockOnSongsChange} 
        />
      );
      
      await waitFor(() => {
        expect(screen.getByText('✕')).toBeInTheDocument();
      });

      await user.click(screen.getByText('✕'));

      expect(mockOnSongsChange).toHaveBeenCalledWith([]);
    });
  });

  describe('Selection Limits', () => {
   it('disables unselected songs when max limit reached', async () => {
  const user = userEvent.setup();
  // Create 21 songs total, select 20 of them
  const twentyOneMockSongs = Array.from({ length: 21 }, (_, i) => ({
    ...mockSongs[0],
    id: `song-${i}`,
    track_name: `Song ${i}`,
    artist_names: 'Artist',
    genres: 'pop',
  }));

  mockFetch.mockResolvedValue({
    ok: true,
    json: async () => twentyOneMockSongs,
  });

  // Select first 20 songs, leaving Song 20 unselected
  render(
    <SongSelector 
      selectedSongs={twentyOneMockSongs.slice(0, 20)} 
      onSongsChange={mockOnSongsChange} 
    />
  );
  
  await waitFor(() => {
    expect(screen.getByText(/add songs/i)).toBeInTheDocument();
  });

  await user.click(screen.getByText(/add songs/i));

  // Find Song 20 which should be disabled (the only unselected song)
  const song20Checkbox = screen.getByLabelText(/Song 20/i);
  expect(song20Checkbox).toBeDisabled();
});

    it('does not add song when limit is reached', async () => {
      const user = userEvent.setup();
      const twentyMockSongs = Array.from({ length: 51 }, (_, i) => ({
        ...mockSongs[0],
        id: `song-${i}`,
        track_name: `Song ${i}`,
      }));

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => twentyMockSongs,
      });

      const selectedSongs = twentyMockSongs.slice(0, 20);

      render(
        <SongSelector 
          selectedSongs={selectedSongs} 
          onSongsChange={mockOnSongsChange} 
        />
      );
      
      await waitFor(() => {
        expect(screen.getByText(/add songs/i)).toBeInTheDocument();
      });

      await user.click(screen.getByText(/add songs/i));

      const disabledCheckbox = screen.getAllByRole('checkbox').find(cb => (cb as HTMLInputElement).disabled);
      await user.click(disabledCheckbox!);

      // Should not call onSongsChange since it's disabled
      expect(mockOnSongsChange).not.toHaveBeenCalled();
    });
  });

  describe('Song Display', () => {
    it('displays song details correctly', async () => {
      const user = userEvent.setup();
      render(<SongSelector selectedSongs={[]} onSongsChange={mockOnSongsChange} />);
      
      await waitFor(() => {
        expect(screen.getByText(/add songs/i)).toBeInTheDocument();
      });

      await user.click(screen.getByText(/add songs/i));

      expect(screen.getByText('High Energy Track')).toBeInTheDocument();
      expect(screen.getByText('Artist One')).toBeInTheDocument();
      expect(screen.getByText(/pop, electronic/i)).toBeInTheDocument();
    });

    it('formats duration correctly', async () => {
      const user = userEvent.setup();
      render(<SongSelector selectedSongs={[]} onSongsChange={mockOnSongsChange} />);
      
      await waitFor(() => {
        expect(screen.getByText(/add songs/i)).toBeInTheDocument();
      });

      await user.click(screen.getByText(/add songs/i));

      // mockSongs[0] has duration_ms: 180000 (3 minutes)
      expect(screen.getByText(/3:00/)).toBeInTheDocument();
    });

    it('applies selected class to selected songs', async () => {
      const user = userEvent.setup();
      render(
        <SongSelector 
          selectedSongs={[mockSongs[0]]} 
          onSongsChange={mockOnSongsChange} 
        />
      );
      
      await waitFor(() => {
        expect(screen.getByText(/add songs/i)).toBeInTheDocument();
      });

      await user.click(screen.getByText(/add songs/i));

      const selectedSongItem = screen.getByText('High Energy Track').closest('.song-item');
      expect(selectedSongItem).toHaveClass('selected');
    });

    it('applies disabled class to disabled songs', async () => {
      const user = userEvent.setup();
      const twentyMockSongs = Array.from({ length: 51 }, (_, i) => ({
        ...mockSongs[0],
        id: `song-${i}`,
        track_name: `Song ${i}`,
      }));

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => twentyMockSongs,
      });

      render(
        <SongSelector 
          selectedSongs={twentyMockSongs.slice(0, 20)} 
          onSongsChange={mockOnSongsChange} 
        />
      );
      
      await waitFor(() => {
        expect(screen.getByText(/add songs/i)).toBeInTheDocument();
      });

      await user.click(screen.getByText(/add songs/i));

      const disabledSongItem = screen.getByText('Song 20').closest('.song-item');
      expect(disabledSongItem).toHaveClass('disabled');
    });
  });

  describe('Integration with Parent Component', () => {
    it('respects externally controlled selected songs', async () => {
      const { rerender } = render(
        <SongSelector 
          selectedSongs={[mockSongs[0]]} 
          onSongsChange={mockOnSongsChange} 
        />
      );
      
      await waitFor(() => {
        expect(screen.getByText('High Energy Track - Artist One')).toBeInTheDocument();
      });

      rerender(
        <SongSelector 
          selectedSongs={[mockSongs[0], mockSongs[1]]} 
          onSongsChange={mockOnSongsChange} 
        />
      );

      expect(screen.getByText('High Energy Track - Artist One')).toBeInTheDocument();
      expect(screen.getByText('Medium Energy Track - Artist Two')).toBeInTheDocument();
    });
  });
});