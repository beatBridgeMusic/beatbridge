import { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthContext } from '../AuthContext';
import type { AuthContextType, User } from '../AuthContext';

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  user?: User | null;
  token?: string | null;
  login?: (userData: User, accessToken: string) => void;
  logout?: () => void;
}

export function renderWithRouter(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  return render(ui, { wrapper: BrowserRouter, ...options });
}

export function renderWithAuth(
  ui: ReactElement,
  { user = null, token = null, login = () => {}, logout = () => {}, ...options }: CustomRenderOptions = {}
) {
  // Default authenticated user
  const defaultUser: User = {
    id: '1',
    email: 'test@example.com',
    username: 'testuser',
  };

  const mockAuthValue: AuthContextType = {
    user: user !== null ? user : defaultUser,
    token: token !== null ? token : 'mock-token-123',
    login,
    logout,
  };

  const AllProviders = ({ children }: { children: React.ReactNode }) => (
    <AuthContext.Provider value={mockAuthValue}>
      <BrowserRouter>{children}</BrowserRouter>
    </AuthContext.Provider>
  );

  return render(ui, { wrapper: AllProviders, ...options });
}

// Helper to render with unauthenticated state
export function renderWithoutAuth(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  return renderWithAuth(ui, { user: null, token: null, ...options });
}

// Re-export commonly used testing utilities
export { screen, waitFor, waitForElementToBeRemoved, within, fireEvent } from '@testing-library/react';