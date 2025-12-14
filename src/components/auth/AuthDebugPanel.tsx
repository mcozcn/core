import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';

const AuthDebugPanel: React.FC = () => {
  const { user } = useAuth();
  const [sessionInfo, setSessionInfo] = useState<any>(null);

  const refresh = async () => {
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        console.warn('getSession error:', error);
      }
      setSessionInfo(data?.session ?? null);
    } catch (err) {
      console.error('getSession failed:', err);
    }
  };

  const [testResult, setTestResult] = useState<any>(null);
  const { toast } = useToast();
  const [password, setPassword] = useState('');

  const signInCurrentUser = async () => {
    if (!user?.email) {
      toast({ title: 'No email for current user', description: 'Cannot sign in to Supabase without an email.' });
      return;
    }

    try {
      const email = user.email;
      const signInResult = await supabase.auth.signInWithPassword({ email, password });
      if (signInResult.error) {
        console.warn('Supabase sign-in error:', signInResult.error);
        // If sign-in failed, attempt to sign up (helpful for first-time setups)
        try {
          const signUpResult = await supabase.auth.signUp({ email, password });
          if (signUpResult.error) {
            // If signup also fails, show the original sign-in error to the user
            console.warn('Supabase signup failed:', signUpResult.error);
            toast({ variant: 'destructive', title: 'Supabase sign-in failed', description: signInResult.error.message || String(signInResult.error) });
            return;
          }
          // After signup, try sign-in again
          const signIn2 = await supabase.auth.signInWithPassword({ email, password });
          if (signIn2.error) {
            console.warn('Supabase sign-in after signup failed:', signIn2.error);
            toast({ variant: 'destructive', title: 'Supabase sign-in failed', description: signIn2.error.message || String(signIn2.error) });
            return;
          }
          toast({ title: 'Supabase signup + sign-in succeeded' });
        } catch (err) {
          console.error('Signup attempt failed:', err);
          toast({ variant: 'destructive', title: 'Supabase signup failed', description: String(err) });
          return;
        }
      } else {
        toast({ title: 'Supabase sign-in succeeded' });
      }

      await refresh();
      await runSupabaseTest();
    } catch (err) {
      console.error('Sign-in failed:', err);
      toast({ variant: 'destructive', title: 'Sign-in failed', description: String(err) });
    }
  };

  const runSupabaseTest = async () => {
    setTestResult({ status: 'running' });
    try {
      const envUrl = import.meta.env.VITE_SUPABASE_URL ?? null;
      const envKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? null;

      const { data: sessionData } = await supabase.auth.getSession();

      // Try a minimal select to verify REST access and permissions
      const { data, error, status } = await supabase
        .from('membership_packages')
        .select('id')
        .limit(1);

      setTestResult({
        env: { url: envUrl, keyExists: !!envKey },
        session: sessionData?.session ?? null,
        query: { data, error, status },
      });
    } catch (err) {
      setTestResult({ status: 'error', error: String(err) });
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  return (
    <div className="p-3 border rounded bg-muted/40 text-sm mb-4">
      <div className="flex items-center justify-between mb-2">
        <div className="font-medium">Auth Debug</div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={refresh}>Refresh</Button>
            <Button size="sm" onClick={() => console.log('Auth debug:', { user, sessionInfo })}>Log</Button>
            <Button size="sm" onClick={runSupabaseTest}>Test Supabase</Button>
        </div>
      </div>
        <div className="mb-2">Current user: <strong>{user?.username ?? 'none'}</strong></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-2 items-center">
          <div>
            <Label>Supabase password</Label>
            <Input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="Enter admin password for Supabase" />
          </div>
          <div className="col-span-2 flex gap-2">
            <Button size="sm" onClick={signInCurrentUser}>Sign in current user to Supabase</Button>
            <Button size="sm" variant="outline" onClick={() => { setPassword(''); }}>Clear</Button>
          </div>
        </div>
        <pre className="max-h-48 overflow-auto text-xs">{JSON.stringify(sessionInfo, null, 2)}</pre>
        <div className="mt-2">
          <div className="font-medium">Test Result</div>
          <pre className="max-h-48 overflow-auto text-xs">{JSON.stringify(testResult, null, 2)}</pre>
        </div>
    </div>
  );
};

export default AuthDebugPanel;
