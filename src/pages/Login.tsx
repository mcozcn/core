import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { login, register } from '@/utils/auth';

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isLogin) {
      const user = login(username, password);
      if (user) {
        toast({
          title: "Başarılı",
          description: "Giriş yapıldı",
        });
        navigate('/');
      } else {
        toast({
          variant: "destructive",
          title: "Hata",
          description: "Kullanıcı adı veya şifre hatalı",
        });
      }
    } else {
      const user = register(username, password);
      if (user) {
        toast({
          title: "Başarılı",
          description: "Kayıt başarılı, giriş yapabilirsiniz",
        });
        setIsLogin(true);
      } else {
        toast({
          variant: "destructive",
          title: "Hata",
          description: "Bu kullanıcı adı zaten kullanılıyor",
        });
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md p-6 space-y-6">
        <h1 className="text-2xl font-bold text-center">
          {isLogin ? 'Giriş Yap' : 'Kayıt Ol'}
        </h1>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="username" className="text-sm font-medium">
              Kullanıcı Adı
            </label>
            <Input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium">
              Şifre
            </label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <Button type="submit" className="w-full">
            {isLogin ? 'Giriş Yap' : 'Kayıt Ol'}
          </Button>
        </form>

        <div className="text-center">
          <button
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            className="text-primary hover:underline"
          >
            {isLogin ? 'Hesap oluştur' : 'Giriş yap'}
          </button>
        </div>
      </Card>
    </div>
  );
};

export default Login;