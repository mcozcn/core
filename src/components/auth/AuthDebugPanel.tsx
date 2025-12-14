import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';

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
        <pre className="max-h-48 overflow-auto text-xs">{JSON.stringify(sessionInfo, null, 2)}</pre>
        <div className="mt-2">
          <div className="font-medium">Test Result</div>
          <pre className="max-h-48 overflow-auto text-xs">{JSON.stringify(testResult, null, 2)}</pre>
        </div>
    </div>
  );
};

export default AuthDebugPanel;
