
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { createUser } from '@/utils/storage/userManager';
import { AVAILABLE_PAGES } from '@/types/user';
import { UserPlus } from 'lucide-react';

interface UserFormProps {
  onSuccess: () => void;
}

const UserForm = ({ onSuccess }: UserFormProps) => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    displayName: '',
    title: '',
    allowedPages: [] as string[],
    canEdit: false,
    canDelete: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePageToggle = (pageId: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      allowedPages: checked 
        ? [...prev.allowedPages, pageId]
        : prev.allowedPages.filter(id => id !== pageId)
    }));
  };

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

    if (formData.allowedPages.length === 0) {
      toast({
        variant: 'destructive',
        title: 'Hata',
        description: 'En az bir sayfa izni seçmelisiniz.'
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const success = await createUser({
        username: formData.username,
        password: formData.password,
        displayName: formData.displayName,
        title: formData.title,
        allowedPages: formData.allowedPages,
        canEdit: formData.canEdit,
        canDelete: formData.canDelete
      });

      if (success) {
        toast({
          title: 'Başarılı',
          description: 'Kullanıcı başarıyla oluşturuldu.'
        });
        
        // Reset form
        setFormData({
          username: '',
          password: '',
          displayName: '',
          title: '',
          allowedPages: [],
          canEdit: false,
          canDelete: false
        });
        
        onSuccess();
      } else {
        toast({
          variant: 'destructive',
          title: 'Hata',
          description: 'Kullanıcı oluşturulamadı. Bu kullanıcı adı zaten kullanılıyor olabilir.'
        });
      }
    } catch (error) {
      console.error('Error creating user:', error);
      toast({
        variant: 'destructive',
        title: 'Hata',
        description: 'Kullanıcı oluşturulurken bir hata oluştu.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="username">Kullanıcı Adı *</Label>
          <Input
            id="username"
            value={formData.username}
            onChange={(e) => handleInputChange('username', e.target.value)}
            placeholder="Kullanıcı adı"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Şifre *</Label>
          <Input
            id="password"
            type="password"
            value={formData.password}
            onChange={(e) => handleInputChange('password', e.target.value)}
            placeholder="Şifre"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="displayName">Görünen Ad *</Label>
          <Input
            id="displayName"
            value={formData.displayName}
            onChange={(e) => handleInputChange('displayName', e.target.value)}
            placeholder="Ad Soyad"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="title">Ünvan</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            placeholder="Ünvan"
          />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Sayfa İzinleri</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {AVAILABLE_PAGES.map((page) => (
              <div key={page.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`page-${page.id}`}
                  checked={formData.allowedPages.includes(page.id)}
                  onCheckedChange={(checked) => 
                    handlePageToggle(page.id, checked === true)
                  }
                />
                <Label 
                  htmlFor={`page-${page.id}`}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {page.icon} {page.label}
                </Label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Diğer İzinler</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="canEdit"
                checked={formData.canEdit}
                onCheckedChange={(checked) => 
                  handleInputChange('canEdit', checked === true)
                }
              />
              <Label htmlFor="canEdit" className="text-sm font-medium">
                Düzenleme İzni
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="canDelete"
                checked={formData.canDelete}
                onCheckedChange={(checked) => 
                  handleInputChange('canDelete', checked === true)
                }
              />
              <Label htmlFor="canDelete" className="text-sm font-medium">
                Silme İzni
              </Label>
            </div>
          </div>
        </CardContent>
      </Card>

      <Button 
        type="submit" 
        disabled={isSubmitting}
        className="w-full"
      >
        <UserPlus className="mr-2 h-4 w-4" />
        {isSubmitting ? 'Oluşturuluyor...' : 'Kullanıcı Oluştur'}
      </Button>
    </form>
  );
};

export default UserForm;
