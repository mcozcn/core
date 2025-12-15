
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@/types/user';
import { getCurrentUser, setCurrentUser, authenticateUser } from '@/utils/storage/userManager';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { verifyToken } from '@/utils/auth/security';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
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
  const { toast } = useToast();

  useEffect(() => {
    initAuth();
  }, []);

  useEffect(() => {
    // Listen for Supabase auth state changes for debugging and to keep session in sync
    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      console.debug('Supabase auth state change:', event, session);
    });

    return () => {
      try {
        listener?.subscription?.unsubscribe?.();
      } catch (e) {
        // ignore
      }
    };
  }, []);

  const initAuth = async () => {
    try {
      const currentUser = await getCurrentUser();
      
      if (currentUser && currentUser.token && verifyToken(currentUser.token)) {
        setUser(currentUser);
        setIsAuthenticated(true);
      } else {
        // Auto-enable public mode: sign-in as a local admin so app has full write access
        const systemUser: User = {
          id: 0,
          username: 'system',
          passwordHash: '',
          displayName: 'Local Admin',
          email: '',
          role: 'admin',
          title: 'Sistem',
          color: '#111827',
          allowedPages: [],
          canEdit: true,
          canDelete: true,
          isVisible: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        setUser(systemUser);
        setIsAuthenticated(true);
        await setCurrentUser(systemUser);
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
          const signInResult = await supabase.auth.signInWithPassword({ email, password });
          if (signInResult.error) {
            console.warn('Supabase sign-in failed, attempting signup...', signInResult.error.message);
            toast({
              variant: 'destructive',
              title: 'Supabase oturumu oluşturulamadı',
              description: `Supabase sign-in hatası: ${signInResult.error.message || 'bilinmeyen hata'}`,
            });
            const signUpResult = await supabase.auth.signUp({ email, password });
            if (signUpResult.error) {
              console.warn('Supabase signup failed:', signUpResult.error.message, signUpResult.error);
              toast({
                variant: 'destructive',
                title: 'Supabase signup başarısız',
                description: signUpResult.error.message || 'Kayıt sırasında hata oluştu',
              });
            } else {
              // Try sign in again
              const signIn2Result = await supabase.auth.signInWithPassword({ email, password });
              if (signIn2Result.error) {
                console.warn('Supabase sign-in after signup failed:', signIn2Result.error.message, signIn2Result.error);
                toast({
                  variant: 'destructive',
                  title: 'Supabase oturumu oluşturulamadı',
                  description: signIn2Result.error.message || 'Oturum açma başarısız',
                });
              }
            }
          }

          // Always log current session after attempts so we can debug 401 issues
          try {
            const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
            if (sessionError) console.warn('Error fetching supabase session:', sessionError);
            console.debug('Supabase session after login attempt:', sessionData?.session ?? null);
          } catch (err) {
            console.warn('getSession failed:', err);
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
    // For compatibility, set a system admin instead of a guest so write operations work
    const systemUser: User = {
      id: 0,
      username: 'system',
      passwordHash: '',
      displayName: 'Local Admin',
      email: '',
      role: 'admin',
      title: 'Sistem',
      color: '#111827',
      allowedPages: [],
      canEdit: true,
      canDelete: true,
      isVisible: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    setUser(systemUser);
    setIsAuthenticated(true);
    await setCurrentUser(systemUser);
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
    <AuthContext.Provider value={{ user, isAuthenticated, login, loginAsGuest, logout, loading }}>
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
