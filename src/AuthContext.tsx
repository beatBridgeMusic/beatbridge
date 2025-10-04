import React, { createContext, useState, ReactNode, useContext } from 'react';
/* eslint-disable react-refresh/only-export-components */
import { useEffect } from 'react';
export interface User {
  id: string;
  email: string;
  username?: string;
}

//  Define context type
interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (userData: User, accessToken: string) => void;
  logout: () => void;
}

// Create context
export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

// Props for provider
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  useEffect(() => {
    const storedToken = localStorage.getItem('access_token');
    const storedUser = localStorage.getItem('user');
    if (storedToken) {
      setToken(storedToken);
    }
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);
  const login = (userData: User, accessToken: string) => {
    setUser(userData);
    setToken(accessToken);
    localStorage.setItem('access_token', accessToken);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
