import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User } from '../types';
import { mockStorage } from '../mocks/storage';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, remember: boolean) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return !!mockStorage.getAuthToken();
  });

  useEffect(() => {
    if (isAuthenticated) {
      setUser(mockStorage.getUser());
    }
  }, [isAuthenticated]);

  const login = async (email: string, _remember: boolean) => {
    const u = mockStorage.getUser();
    const updatedUser = { ...u, email };
    mockStorage.saveUser(updatedUser);
    mockStorage.setAuthToken('mock_jwt_token_2026');
    setUser(updatedUser);
    setIsAuthenticated(true);
  };

  const logout = () => {
    mockStorage.removeAuthToken();
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
