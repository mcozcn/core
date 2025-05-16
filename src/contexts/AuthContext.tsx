
import React, { createContext, useContext, useEffect, useState } from 'react';
import { getCurrentUser, setCurrentUser, type User } from '@/utils/auth';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(getCurrentUser());
  const [isAuthenticated, setIsAuthenticated] = useState(!!getCurrentUser());

  const login = (userData: User) => {
    setUser(userData);
    setCurrentUser(userData);
    setIsAuthenticated(true);
  };

  const logout = () => {
    setUser(null);
    setCurrentUser(null);
    setIsAuthenticated(false);
  };

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
      setIsAuthenticated(true);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
