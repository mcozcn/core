
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from '@/contexts/AuthContext';
import { getUsers } from '@/utils/storage/users';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { login, isAuthenticated } = useAuth();
  
  // Check if user is already authenticated and redirect accordingly
  // Only run once on component mount
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
      // Önce localStorage'dan kullanıcıları kontrol edelim
      let users = [];
      try {
        const localStorageUsers = localStorage.getItem('users');
        if (localStorageUsers) {
          users = JSON.parse(localStorageUsers);
        }
      } catch (error) {
        console.error('LocalStorage users parsing error:', error);
      }
      
      // Eğer localStorage'da kullanıcı yoksa, IndexedDB'yi deneyelim
      if (!users.length) {
        try {
          users = await getUsers();
        } catch (error) {
          console.error('IndexedDB users fetch error:', error);
        }
      }

      const user = users.find(u => u.username === username && u.password === password);

      if (user) {
        await login(user);
        toast({
          title: "Giriş başarılı",
          description: "Hoş geldiniz!",
        });
        
        // Get the intended destination from location state or default to dashboard
        const from = location.state?.from?.pathname || '/';
        navigate(from, { replace: true });
      } else {
        toast({
          variant: "destructive",
          title: "Giriş başarısız",
          description: "Kullanıcı adı veya şifre hatalı.",
        });
      }
    } catch (error) {
      console.error('Login error:', error);
      toast({
        variant: "destructive",
        title: "Hata",
        description: "Giriş yapılırken bir hata oluştu.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-full max-w-md p-6">
        <h1 className="text-2xl font-serif mb-6 text-center">Giriş Yap</h1>
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Kullanıcı Adı</Label>
            <Input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
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
              required
            />
          </div>
          <Button 
            type="submit" 
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? "Giriş yapılıyor..." : "Giriş Yap"}
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default Login;
