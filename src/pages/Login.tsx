import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { getUsers, setCurrentUser } from '@/utils/localStorage';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const users = getUsers();
      const user = users.find(u => u.username === username && u.password === password);

      if (user) {
        setCurrentUser(user);
        toast({
          title: "Giriş başarılı",
          description: "Hoş geldiniz!",
        });
        navigate('/');
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