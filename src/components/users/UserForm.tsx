
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { createUser } from '@/utils/storage/userManager';
import { AVAILABLE_PAGES } from '@/types/user';
import { User, UserPlus, Eye, Settings } from 'lucide-react';

interface UserFormProps {
  onSuccess: () => void;
}

const UserForm = ({ onSuccess }: UserFormProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    displayName: '',
    title: '',
    canEdit: false,
    canDelete: false
  });
  const [selectedPages, setSelectedPages] = useState<string[]>(['dashboard']);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.username || !formData.password || !formData.displayName) {
      toast({
        variant: 'destructive',
        title: 'Hata',
        description: 'Lütfen tüm zorunlu alanları doldurun.'
      });
      return;
    }

    setLoading(true);
    
    try {
      await createUser({
        username: formData.username,
        password: formData.password,
        displayName: formData.displayName,
        title: formData.title || 'Personel',
        allowedPages: selectedPages,
        canEdit: formData.canEdit,
        canDelete: formData.canDelete
      });

      toast({
        title: 'Başarılı',
        description: `${formData.displayName} kullanıcısı oluşturuldu.`
      });

      // Form sıfırla
      setFormData({
        username: '',
        password: '',
        displayName: '',
        title: '',
        canEdit: false,
        canDelete: false
      });
      setSelectedPages(['dashboard']);
      
      onSuccess();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Hata',
        description: 'Kullanıcı oluşturulamadı.'
      });
    } finally {
      setLoading(false);
    }
  };

  const togglePage = (pageId: string) => {
    if (pageId === 'dashboard') return; // Dashboard zorunlu
    
    setSelectedPages(current => 
      current.includes(pageId)
        ? current.filter(id => id !== pageId)
        : [...current, pageId]
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Kullanıcı Bilgileri
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="username">Kullanıcı Adı *</Label>
            <Input
              id="username"
              value={formData.username}
              onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
              placeholder="kullanici_adi"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">Şifre *</Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
              placeholder="Güvenli şifre"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="displayName">Tam Ad *</Label>
            <Input
              id="displayName"
              value={formData.displayName}
              onChange={(e) => setFormData(prev => ({ ...prev, displayName: e.target.value }))}
              placeholder="Ad Soyad"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="title">Ünvan</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Kuaför, Berber..."
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Sistem Yetkileri
          </CardTitle>
        </CardHeader>
        <CardContent className="flex gap-6">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="canEdit"
              checked={formData.canEdit}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, canEdit: !!checked }))}
            />
            <Label htmlFor="canEdit">Düzenleme</Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox
              id="canDelete"
              checked={formData.canDelete}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, canDelete: !!checked }))}
            />
            <Label htmlFor="canDelete">Silme</Label>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Sayfa Erişim Yetkileri
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {AVAILABLE_PAGES.map((page) => (
              <div
                key={page.id}
                className={`p-3 border rounded-lg cursor-pointer transition-all ${
                  selectedPages.includes(page.id)
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
                onClick={() => togglePage(page.id)}
              >
                <div className="flex items-center space-x-3">
                  <Checkbox
                    checked={selectedPages.includes(page.id)}
                    disabled={page.id === 'dashboard'}
                    onChange={() => {}} // Handled by parent click
                  />
                  <div className="flex-1">
                    <Label className="flex items-center gap-2 cursor-pointer">
                      <span>{page.icon}</span>
                      {page.label}
                      {page.id === 'dashboard' && <span className="text-xs text-muted-foreground">(Zorunlu)</span>}
                    </Label>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? (
          <>
            <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
            Oluşturuluyor...
          </>
        ) : (
          <>
            <UserPlus className="w-4 h-4 mr-2" />
            Kullanıcı Oluştur
          </>
        )}
      </Button>
    </form>
  );
};

export default UserForm;
