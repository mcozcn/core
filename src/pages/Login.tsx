
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { login, isAuthenticated } = useAuth();
  
  useEffect(() => {
    if (isAuthenticated) {
      const from = location.state?.from?.pathname || '/';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location.state]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const success = await login(username, password);

      if (success) {
        toast({
          title: 'Giriş başarılı',
          description: 'Hoş geldiniz!'
        });
        
        const from = location.state?.from?.pathname || '/';
        navigate(from, { replace: true });
      } else {
        toast({
          variant: 'destructive',
          title: 'Giriş başarısız',
          description: 'Kullanıcı adı veya şifre hatalı.'
        });
      }
    } catch (error) {
      console.error('Login error:', error);
      toast({
        variant: 'destructive',
        title: 'Hata',
        description: 'Giriş yapılırken bir hata oluştu.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-full max-w-md p-6">
        <div className="text-center mb-6">
          <img 
            src="/lovable-uploads/18599c6d-da00-4149-814e-e1ce55f990d5.png" 
            alt="Beautiq Logo" 
            className="w-48 mx-auto mb-4"
          />
          <h1 className="text-2xl font-serif">Giriş Yap</h1>
        </div>
        
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Kullanıcı Adı</Label>
            <Input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="admin, mco veya personel"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Şifre</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Şifrenizi girin"
              required
            />
          </div>
          <Button 
            type="submit" 
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
          </Button>
        </form>
        
        <div className="mt-6 p-4 bg-muted/50 rounded-lg">
          <p className="text-sm font-medium mb-2">Test Kullanıcıları:</p>
          <div className="space-y-1 text-xs text-muted-foreground">
            <div><strong>Admin:</strong> admin / admin</div>
            <div><strong>Manager:</strong> mco / 1474</div>
            <div><strong>Personel:</strong> personel / personel</div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Login;
