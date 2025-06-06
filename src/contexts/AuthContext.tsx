
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
        // Önce localStorage kontrolü
        const localStorageUser = localStorage.getItem('currentUser');
        let currentUser = null;
        
        if (localStorageUser) {
          try {
            currentUser = JSON.parse(localStorageUser);
            console.log('LocalStorage user found:', currentUser);
          } catch (error) {
            console.error('LocalStorage user parsing error:', error);
          }
        }
        
        // Eğer localStorage'da kullanıcı yoksa, IndexedDB'yi dene
        if (!currentUser) {
          try {
            currentUser = await getCurrentUser();
            console.log('IndexedDB user found:', currentUser);
          } catch (error) {
            console.error('IndexedDB user fetch error:', error);
          }
        }
        
        if (currentUser) {
          setUser(currentUser);
          setIsAuthenticated(true);
          console.log('User authenticated:', currentUser.username);
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
      console.log('Logging in user:', userData.username);
      setUser(userData);
      setIsAuthenticated(true);
      
      // localStorage'a kaydet
      localStorage.setItem('currentUser', JSON.stringify(userData));
      
      // IndexedDB'ye kaydet
      try {
        await setCurrentUser(userData);
      } catch (error) {
        console.error('IndexedDB login error:', error);
      }
    } catch (error) {
      console.error('Error during login:', error);
    }
  };

  const logout = async () => {
    try {
      console.log('Logging out user');
      setUser(null);
      setIsAuthenticated(false);
      
      // localStorage'dan temizle
      localStorage.removeItem('currentUser');
      
      // IndexedDB'den temizle
      try {
        await setCurrentUser(null);
      } catch (error) {
        console.error('IndexedDB logout error:', error);
      }
    } catch (error) {
      console.error('Error during logout:', error);
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
