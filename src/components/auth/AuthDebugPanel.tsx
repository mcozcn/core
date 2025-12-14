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
        </div>
      </div>
      <div className="mb-2">Current user: <strong>{user?.username ?? 'none'}</strong></div>
      <pre className="max-h-48 overflow-auto text-xs">{JSON.stringify(sessionInfo, null, 2)}</pre>
    </div>
  );
};

export default AuthDebugPanel;
