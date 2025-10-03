import { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../AuthContext';

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  authValue?: {
    user: any;
    login: () => Promise<void>;
    logout: () => void;
    loading: boolean;
  };
}

export function renderWithRouter(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  return render(ui, { wrapper: BrowserRouter, ...options });
}

export function renderWithAuth(
  ui: ReactElement,
  { authValue, ...options }: CustomRenderOptions = {}
) {
  const defaultAuthValue = {
    user: { id: '1', email: 'test@example.com', username: 'testuser' },
    login: async () => {},
    logout: () => {},
    loading: false,
    ...authValue,
  };

  const AllProviders = ({ children }: { children: React.ReactNode }) => (
    <AuthProvider value={defaultAuthValue}>
      <BrowserRouter>{children}</BrowserRouter>
    </AuthProvider>
  );

  return render(ui, { wrapper: AllProviders, ...options });
}

export * from '@testing-library/react';
