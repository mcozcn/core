import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

const GuestPrompt = () => {
  const navigate = useNavigate();
  const { loginAsGuest } = useAuth();

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-3xl px-4">
      <div className="bg-card/95 border border-border px-4 py-3 rounded-md shadow-lg flex items-center justify-between gap-4">
        <div className="flex-1">
          <strong>Misafir modu</strong>
          <div className="text-sm text-muted-foreground">Uygulamayı denemek için misafir olarak devam edebilir veya admin olarak giriş yapabilirsiniz.</div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            onClick={() => navigate('/login')}
            className="h-9"
          >
            Giriş Yap
          </Button>
          <Button
            onClick={async () => {
              await loginAsGuest();
              navigate('/');
            }}
            className="h-9"
          >
            Misafir olarak devam et
          </Button>
        </div>
      </div>
    </div>
  );
};

export default GuestPrompt;
