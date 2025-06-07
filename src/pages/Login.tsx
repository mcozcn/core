
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
    <div className="min-h-screen relative flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary/10">
      {/* Background Logo */}
      <div className="absolute inset-0 flex items-center justify-center opacity-5">
        <img 
          src="/lovable-uploads/18599c6d-da00-4149-814e-e1ce55f990d5.png" 
          alt="Beautiq Logo" 
          className="w-96 h-96 object-contain"
        />
      </div>
      
      {/* Login Card */}
      <div className="relative z-10 w-full max-w-md px-6">
        <Card className="backdrop-blur-sm bg-card/95 border-border/50 shadow-2xl">
          <div className="p-8 space-y-6">
            <div className="text-center space-y-2">
              <img 
                src="/lovable-uploads/18599c6d-da00-4149-814e-e1ce55f990d5.png" 
                alt="Beautiq Logo" 
                className="w-32 mx-auto mb-4 opacity-90"
              />
              <h1 className="text-3xl font-serif text-foreground">Hoş Geldiniz</h1>
              <p className="text-muted-foreground">Hesabınıza giriş yapın</p>
            </div>
            
            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-sm font-medium">
                  Kullanıcı Adı
                </Label>
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Kullanıcı adınızı girin"
                  className="h-12 text-base"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">
                  Şifre
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Şifrenizi girin"
                  className="h-12 text-base"
                  required
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full h-12 text-base font-medium bg-primary hover:bg-primary/90 transition-colors"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Giriş yapılıyor...
                  </div>
                ) : (
                  'Giriş Yap'
                )}
              </Button>
            </form>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Login;
