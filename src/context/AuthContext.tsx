import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User } from '../types';
import { mockStorage } from '../mocks/storage';
import { API_BASE_URL } from '../services/api';

function parseJwt(token: string) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(window.atob(base64));
  } catch (e) {
    return null;
  }
}
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string, remember: boolean) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      const payload = parseJwt(token);
      if (payload && payload.exp * 1000 > Date.now()) {
        setUser({
          id: payload.sub,
          name: payload.name || 'User',
          email: payload.email,
          role: payload.role as any,
        });
        setIsAuthenticated(true);
      } else {
        localStorage.removeItem('access_token');
      }
    }
  }, []);

  const login = async (email: string, password: string, _remember: boolean) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => null);
      throw new Error(errData?.message || 'Erro ao realizar login');
    }

    const data = await response.json();
    const token = data.access_token;
    
    localStorage.setItem('access_token', token);
    
    const payload = parseJwt(token);
    const loggedUser: User = {
      id: payload.sub,
      name: payload.name || 'User',
      email: payload.email,
      role: payload.role as any,
    };

    setUser(loggedUser);
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
