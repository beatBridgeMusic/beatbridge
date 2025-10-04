import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import FloatingNotes from './FloatingNotes';

describe('FloatingNotes', () => {
  it('renders 16 floating notes', () => {
    const { container } = render(<FloatingNotes />);
    
    // Count motion.div elements with musical notes
    const notes = container.querySelectorAll('[class*="absolute"]');
    expect(notes.length).toBe(16);
  });

  it('renders only musical note emojis', () => {
    const { container } = render(<FloatingNotes />);
    
    const validNotes = ['🎵', '🎶', '🎼', '♫'];
    const notes = Array.from(container.querySelectorAll('[class*="absolute"][class*="text-white"]'));
    
    notes.forEach((note) => {
      expect(validNotes).toContain(note.textContent);
    });
  });

  it('is non-interactive', () => {
    const { container } = render(<FloatingNotes />);
    
    const parentDiv = container.firstChild;
    expect(parentDiv).toHaveClass('pointer-events-none');
  });
});