
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
        // Önce localStorage kontrolü yapalım - IndexedDB sorunları için fallback
        const localStorageUser = localStorage.getItem('currentUser');
        let currentUser = null;
        
        if (localStorageUser) {
          try {
            currentUser = JSON.parse(localStorageUser);
          } catch (error) {
            console.error('LocalStorage user parsing error:', error);
          }
        }
        
        // Eğer localStorage'da kullanıcı yoksa, IndexedDB'yi deneyelim
        if (!currentUser) {
          try {
            currentUser = await getCurrentUser();
          } catch (error) {
            console.error('IndexedDB user fetch error:', error);
          }
        }
        
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
      // Önce state'i güncelleyelim ki kullanıcı deneyimi kesilmesin
      setUser(userData);
      setIsAuthenticated(true);
      
      // Sonra localStorage'a kaydedelim (hızlı erişim için)
      localStorage.setItem('currentUser', JSON.stringify(userData));
      
      // Son olarak IndexedDB'ye kaydedelim (daha kalıcı depolama için)
      try {
        await setCurrentUser(userData);
      } catch (error) {
        console.error('IndexedDB login error:', error);
        // localStorage zaten güncellendiği için ek işleme gerek yok
      }
    } catch (error) {
      console.error('Error during login:', error);
      // Hata durumunda bile state'i güncellemek istiyoruz çünkü localStorage bu noktada güncellenmiş olmalı
    }
  };

  const logout = async () => {
    try {
      // Önce state'i temizleyelim
      setUser(null);
      setIsAuthenticated(false);
      
      // localStorage'dan çıkış
      localStorage.removeItem('currentUser');
      
      // IndexedDB'den çıkış
      try {
        await setCurrentUser(null);
      } catch (error) {
        console.error('IndexedDB logout error:', error);
        // localStorage zaten temizlendiği için ek işleme gerek yok
      }
    } catch (error) {
      console.error('Error during logout:', error);
      // Hata durumunda bile state'i temizliyoruz, çünkü localStorage bu noktada temizlenmiş olmalı
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
