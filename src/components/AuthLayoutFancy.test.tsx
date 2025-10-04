import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { axe } from 'vitest-axe';
import AuthLayoutFancy from './AuthLayoutFancy';

describe('AuthLayoutFancy', () => {
  it('renders children content', () => {
    render(
      <AuthLayoutFancy>
        <div>Test Content</div>
      </AuthLayoutFancy>
    );
    
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('displays the BeatBridge branding', () => {
    render(
      <AuthLayoutFancy>
        <div>Content</div>
      </AuthLayoutFancy>
    );
    
    expect(screen.getByText('BeatBridge.')).toBeInTheDocument();
    expect(
      screen.getByText(/Order your customized playlist by any metric/i)
    ).toBeInTheDocument();
  });

  it('renders floating notes', () => {
    const { container } = render(
      <AuthLayoutFancy>
        <div>Content</div>
      </AuthLayoutFancy>
    );
    
    // Check for musical note emojis
    const notes = container.querySelectorAll('[class*="absolute"]');
    expect(notes.length).toBeGreaterThan(0);
  });

  it('applies gradient background animation class', () => {
    const { container } = render(
      <AuthLayoutFancy>
        <div>Content</div>
      </AuthLayoutFancy>
    );
    
    const bgElement = container.querySelector('.bg-animated');
    expect(bgElement).toBeInTheDocument();
  });

    it('is accessible', async () => {
    const { container } = render(
      <AuthLayoutFancy>
        <div>Accessible Content</div>
      </AuthLayoutFancy>
    );
    const results = await axe(container);
  }) 
});
