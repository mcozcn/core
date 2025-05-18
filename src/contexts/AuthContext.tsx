
import React, { createContext, useContext, useEffect, useState } from 'react';
import { getCurrentUser, setCurrentUser, type User } from '@/utils/storage/users';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (user: User) => void;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      setLoading(true);
      try {
        // Use localStorage as fallback when IndexedDB fails
        const currentUser = await getCurrentUser().catch(() => {
          const storedUser = localStorage.getItem('currentUser');
          if (storedUser) {
            try {
              return JSON.parse(storedUser);
            } catch (e) {
              return null;
            }
          }
          return null;
        });
        
        if (currentUser) {
          setUser(currentUser);
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (userData: User) => {
    try {
      // First try with the storage API
      await setCurrentUser(userData).catch(() => {
        // Fallback to localStorage
        localStorage.setItem('currentUser', JSON.stringify(userData));
      });
      
      // Update state regardless of storage method
      setUser(userData);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Error during login:', error);
      // Still update the state in memory even if storage fails
      setUser(userData);
      setIsAuthenticated(true);
    }
  };

  const logout = async () => {
    try {
      await setCurrentUser(null).catch(() => {
        localStorage.removeItem('currentUser');
      });
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      // Always clear the state
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout, loading }}>
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
