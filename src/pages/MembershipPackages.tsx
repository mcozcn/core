import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash2, Check, X } from 'lucide-react';
import { getMembershipPackages, saveMembershipPackage, updateMembershipPackage, deleteMembershipPackage, MembershipPackage } from '@/utils/storage/membershipPackages';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';

const MembershipPackages = () => {
  const { toast } = useToast();
  const { isGuest } = useAuth();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<MembershipPackage | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    duration: 1,
    price: 0,
    features: [] as string[],
    type: 'standard' as 'standard' | 'premium' | 'vip',
    isActive: true,
  });
  const [newFeature, setNewFeature] = useState('');

  const { data: packages = [], refetch } = useQuery({
    queryKey: ['membershipPackages'],
    queryFn: getMembershipPackages,
  });

  const handleOpenDialog = (pkg?: MembershipPackage) => {
    if (pkg) {
      setEditingPackage(pkg);
      setFormData({
        name: pkg.name,
        description: pkg.description || '',
        duration: pkg.duration,
        price: pkg.price,
        features: pkg.features,
        type: pkg.type,
        isActive: pkg.isActive,
      });
    } else {
      setEditingPackage(null);
      setFormData({
        name: '',
        description: '',
        duration: 1,
        price: 0,
        features: [],
        type: 'standard',
        isActive: true,
      });
    }
    setDialogOpen(true);
  };

  const handleAddFeature = () => {
    if (newFeature.trim()) {
      setFormData(prev => ({
        ...prev,
        features: [...prev.features, newFeature.trim()]
      }));
      setNewFeature('');
    }
  };

  const handleRemoveFeature = (index: number) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }));
  };

  const handleSave = async () => {
    if (isGuest) {
      toast({
        variant: 'destructive',
        title: 'İzin yok',
        description: 'Misafir modunda paket oluşturamaz veya düzenleyemezsiniz. Lütfen admin olarak giriş yapın.'
      });
      return;
    }
    if (!formData.name || !formData.price) {
      toast({
        variant: 'destructive',
        title: 'Hata',
        description: 'Lütfen tüm gerekli alanları doldurun',
      });
      return;
    }

    const result = editingPackage
      ? await updateMembershipPackage(editingPackage.id, formData)
      : await saveMembershipPackage(formData);

    if (result.success) {
      toast({
        title: 'Başarılı',
        description: `Paket ${editingPackage ? 'güncellendi' : 'oluşturuldu'}`,
      });
      refetch();
      setDialogOpen(false);
    } else {
      console.error('Membership save/update failed:', result.error);
      const status = result.status;
      toast({
        variant: 'destructive',
        title: status === 401 ? 'Yetkisiz (401)' : 'Hata',
        description: status === 401
          ? `Sunucu: 401 Yetkisiz. ${result.error?.message ?? ''} Admin olarak giriş yaptığınızdan ve Supabase RLS politikalarının yazma izni verdiğinden emin olun. (docs/supabase-auth-and-rls.md)`
          : `İşlem başarısız oldu. ${result.error?.message ?? ''} Lütfen konsoldaki hatayı kontrol edin ve gerekirse dokümantasyona bakın.`,
      });
    }
  };

  const handleDelete = async (id: string | number) => {
    if (window.confirm('Bu paketi silmek istediğinizden emin misiniz?')) {
      const success = await deleteMembershipPackage(id);
      if (success) {
        toast({
          title: 'Başarılı',
          description: 'Paket silindi',
        });
        refetch();
      }
    }
  };

  const getPackageColor = (type: string) => {
    switch (type) {
      case 'standard':
        return 'from-secondary/20 to-secondary/10';
      case 'premium':
        return 'from-primary/20 to-primary/10';
      case 'vip':
        return 'from-yellow-500/20 to-yellow-500/10';
      default:
        return 'from-muted to-muted/50';
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-6 md:ml-56">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 md:mb-8">
          <div>
            <h1 className="text-2xl md:text-4xl font-bold mb-1 md:mb-2">Üyelik Paketleri</h1>
            <p className="text-sm md:text-base text-muted-foreground">Spor salonu üyelik paketlerini yönetin</p>
          </div>
          <Button onClick={() => handleOpenDialog()} size="sm" className="gradient-primary w-full sm:w-auto">
            <Plus className="mr-2 h-4 w-4" />
            Yeni Paket
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {packages.map((pkg) => (
            <Card key={pkg.id} className={`relative overflow-hidden bg-gradient-to-br ${getPackageColor(pkg.type)}`}>
              <CardHeader className="p-4 md:p-6">
                <div className="flex justify-between items-start">
                  <div className="min-w-0 flex-1 mr-2">
                    <CardTitle className="text-lg md:text-2xl truncate">{pkg.name}</CardTitle>
                    <CardDescription className="mt-1 md:mt-2 text-sm line-clamp-2">{pkg.description}</CardDescription>
                  </div>
                  {pkg.isActive && (
                    <span className="bg-green-500 text-white text-[10px] md:text-xs px-1.5 md:px-2 py-0.5 md:py-1 rounded-full flex-shrink-0">Aktif</span>
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-4 md:p-6 pt-0 md:pt-0">
                <div className="space-y-3 md:space-y-4">
                  <div>
                    <div className="text-2xl md:text-3xl font-bold text-primary">₺{pkg.price.toLocaleString()}</div>
                    <div className="text-xs md:text-sm text-muted-foreground">{pkg.duration} ay</div>
                  </div>

                  <div className="space-y-1.5 md:space-y-2">
                    {pkg.features.slice(0, 4).map((feature, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Check className="h-3 w-3 md:h-4 md:w-4 text-green-500 flex-shrink-0" />
                        <span className="text-xs md:text-sm truncate">{feature}</span>
                      </div>
                    ))}
                    {pkg.features.length > 4 && (
                      <div className="text-xs text-muted-foreground">+{pkg.features.length - 4} daha</div>
                    )}
                  </div>

                  <div className="flex gap-2 pt-3 md:pt-4 border-t">
                    <Button variant="outline" size="sm" onClick={() => handleOpenDialog(pkg)} className="flex-1 text-xs md:text-sm">
                      <Edit className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
                      Düzenle
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDelete(String(pkg.id))}>
                      <Trash2 className="h-3 w-3 md:h-4 md:w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="w-[95vw] max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingPackage ? 'Paket Düzenle' : 'Yeni Paket Oluştur'}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Paket Adı *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Örn: Standart Üyelik"
                />
              </div>

              <div>
                <Label htmlFor="description">Açıklama</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Paket açıklaması"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 md:gap-4">
                <div>
                  <Label htmlFor="duration">Süre (Ay) *</Label>
                  <Input
                    id="duration"
                    type="number"
                    min="1"
                    value={formData.duration}
                    onChange={(e) => setFormData(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                  />
                </div>

                <div>
                  <Label htmlFor="price">Fiyat (₺) *</Label>
                  <Input
                    id="price"
                    type="number"
                    min="0"
                    value={formData.price}
                    onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) }))}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="type">Paket Tipi</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value: 'standard' | 'premium' | 'vip') => 
                    setFormData(prev => ({ ...prev, type: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standard">Standard</SelectItem>
                    <SelectItem value="premium">Premium</SelectItem>
                    <SelectItem value="vip">VIP</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Özellikler</Label>
                <div className="space-y-2">
                  {formData.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2 bg-muted p-2 rounded">
                      <Check className="h-4 w-4 text-green-500" />
                      <span className="flex-1 text-sm">{feature}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveFeature(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  
                  <div className="flex gap-2">
                    <Input
                      value={newFeature}
                      onChange={(e) => setNewFeature(e.target.value)}
                      placeholder="Yeni özellik ekle"
                      onKeyPress={(e) => e.key === 'Enter' && handleAddFeature()}
                    />
                    <Button onClick={handleAddFeature} size="sm">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="isActive">Aktif</Label>
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  İptal
                </Button>
                <Button onClick={handleSave} className="gradient-primary">
                  {editingPackage ? 'Güncelle' : 'Oluştur'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default MembershipPackages;
