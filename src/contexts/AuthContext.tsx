
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@/types/user';
import { getCurrentUser, setCurrentUser, authenticateUser } from '@/utils/storage/userManager';
import { supabase } from '@/integrations/supabase/client';
import { verifyToken } from '@/utils/auth/security';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isGuest?: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  loginAsGuest: () => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initAuth();
  }, []);

  const initAuth = async () => {
    try {
      const currentUser = await getCurrentUser();
      
      if (currentUser && currentUser.token && verifyToken(currentUser.token)) {
        setUser(currentUser);
        setIsAuthenticated(true);
      } else {
        // Do not auto-login as guest so admin users can explicitly sign in.
        // Leave user null / unauthenticated; the UI will present clear options to
        // 'Continue as guest' or 'Login' so admin login is visible.
        await setCurrentUser(null);
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Auth init error:', error);
      await setCurrentUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const authResult = await authenticateUser(username, password);
      
      if (authResult) {
        setUser(authResult.user);
        setIsAuthenticated(true);
        await setCurrentUser(authResult.user);
        // Try to sign in to Supabase so admin users can perform writes if RLS
        // policies allow authenticated users. If sign in fails, attempt to
        // sign up programmatically (useful for first-time setups).
        try {
          const email = authResult.user.email || `${authResult.user.username}@core.com`;
          const { error: signInError } = await supabase.auth.signInWithPassword({
            email,
            password,
          });

          if (signInError) {
            console.warn('Supabase sign-in failed, attempting signup...', signInError.message);
            const { error: signUpError } = await supabase.auth.signUp({ email, password });
            if (signUpError) {
              console.warn('Supabase signup failed:', signUpError.message);
            } else {
              // Try sign in again
              const { error: signIn2Error } = await supabase.auth.signInWithPassword({ email, password });
              if (signIn2Error) console.warn('Supabase sign-in after signup failed:', signIn2Error.message);
            }
          }
        } catch (err) {
          console.warn('Supabase auth attempt failed:', err);
        }
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const loginAsGuest = async () => {
    const guestUser: User = {
      id: 0,
      username: 'guest',
      displayName: 'Misafir',
      email: null,
      role: 'guest',
      title: 'Misafir',
      color: '#9CA3AF',
      allowedPages: [],
      canEdit: false,
      canDelete: false,
      isVisible: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    setUser(guestUser);
    setIsAuthenticated(true);
    await setCurrentUser(guestUser);
  };

  const logout = async () => {
    // Also sign out from Supabase to clear any session
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.warn('Supabase signOut failed:', err);
    }

    setUser(null);
    setIsAuthenticated(false);
    await setCurrentUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isGuest: user?.role === 'guest', login, loginAsGuest, logout, loading }}>
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
