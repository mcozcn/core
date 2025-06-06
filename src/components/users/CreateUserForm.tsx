
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/components/ui/use-toast";
import { addUser } from "@/utils/storage/users";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { User, Lock, Mail, Briefcase, Settings, Eye } from "lucide-react";

interface CreateUserFormProps {
  onSuccess: () => void;
}

const availablePages = [
  { id: "dashboard", label: "Ana Sayfa", description: "Dashboard ve genel bakış", icon: "📊" },
  { id: "appointments", label: "Randevular", description: "Randevu yönetimi", icon: "📅" },
  { id: "customers", label: "Müşteriler", description: "Müşteri bilgileri ve kayıtları", icon: "👥" },
  { id: "services", label: "Hizmetler", description: "Hizmet tanımları ve fiyatları", icon: "✂️" },
  { id: "stock", label: "Stok Yönetimi", description: "Ürün stok takibi", icon: "📦" },
  { id: "sales", label: "Satışlar", description: "Satış işlemleri", icon: "🛒" },
  { id: "costs", label: "Masraflar", description: "Gider yönetimi", icon: "💰" },
  { id: "financial", label: "Finansal Takip", description: "Mali raporlar", icon: "💳" },
  { id: "reports", label: "Raporlar", description: "Analiz ve raporlama", icon: "📈" },
  { id: "backup", label: "Yedekleme", description: "Veri yedekleme", icon: "💾" },
  { id: "performance", label: "Performans", description: "Performans takibi", icon: "🎯" },
];

const CreateUserForm = ({ onSuccess }: CreateUserFormProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    displayName: "",
    title: "",
    canEdit: false,
    canDelete: false,
  });
  const [selectedPages, setSelectedPages] = useState<string[]>(["dashboard"]);

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!formData.username || !formData.password || !formData.displayName) {
        toast({
          variant: "destructive",
          title: "Eksik Bilgi",
          description: "Lütfen tüm zorunlu alanları doldurun.",
        });
        return;
      }

      if (selectedPages.length === 0) {
        toast({
          variant: "destructive",
          title: "Yetki Hatası", 
          description: "En az bir sayfa yetkisi seçmelisiniz.",
        });
        return;
      }

      console.log("Yeni kullanıcı oluşturuluyor:", {
        username: formData.username,
        displayName: formData.displayName,
        selectedPages: selectedPages,
        canEdit: formData.canEdit,
        canDelete: formData.canDelete
      });

      const newUser = await addUser({
        username: formData.username,
        password: formData.password,
        displayName: formData.displayName,
        email: `${formData.username}@salon.com`,
        role: "staff",
        title: formData.title || "Personel",
        color: '#6E59A5',
        allowedPages: selectedPages,
        canEdit: formData.canEdit,
        canDelete: formData.canDelete,
        createdAt: new Date(),
      });

      console.log("Kullanıcı başarıyla oluşturuldu:", newUser);

      toast({
        title: "Başarılı",
        description: `${formData.displayName} kullanıcısı başarıyla oluşturuldu.`,
      });

      // Form sıfırlama
      setFormData({
        username: "",
        password: "",
        displayName: "",
        title: "",
        canEdit: false,
        canDelete: false,
      });
      setSelectedPages(["dashboard"]);

      onSuccess();
    } catch (error) {
      console.error("Error creating user:", error);
      toast({
        variant: "destructive",
        title: "Hata",
        description: "Kullanıcı oluşturulurken bir hata oluştu.",
      });
    } finally {
      setLoading(false);
    }
  };

  const togglePage = (pageId: string) => {
    setSelectedPages(current => {
      if (pageId === "dashboard") {
        // Dashboard her zaman seçili kalmalı
        return current;
      }
      
      const newSelection = current.includes(pageId)
        ? current.filter(id => id !== pageId)
        : [...current, pageId];
      
      console.log("Sayfa yetkileri güncellendi:", pageId, "->", newSelection);
      return newSelection;
    });
  };

  const selectAllPages = () => {
    const allPageIds = availablePages.map(page => page.id);
    setSelectedPages(allPageIds);
    console.log("Tüm sayfa yetkileri seçildi:", allPageIds);
  };

  const selectBasicPages = () => {
    const basicPages = ["dashboard", "appointments", "customers", "services"];
    setSelectedPages(basicPages);
    console.log("Temel sayfa yetkileri seçildi:", basicPages);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Kullanıcı Bilgileri */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Kullanıcı Bilgileri
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="username" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Kullanıcı Adı *
              </Label>
              <Input
                id="username"
                value={formData.username}
                onChange={(e) => handleInputChange("username", e.target.value)}
                placeholder="kullanici_adi"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password" className="flex items-center gap-2">
                <Lock className="h-4 w-4" />
                Şifre *
              </Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
                placeholder="Güvenli şifre"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="displayName" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Görünen Ad *
              </Label>
              <Input
                id="displayName"
                value={formData.displayName}
                onChange={(e) => handleInputChange("displayName", e.target.value)}
                placeholder="Tam Ad Soyad"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="title" className="flex items-center gap-2">
                <Briefcase className="h-4 w-4" />
                Ünvan
              </Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                placeholder="Kuaför, Berber, Estetisyen..."
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sistem Yetkileri */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Sistem Yetkileri
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-6">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="canEdit"
                checked={formData.canEdit}
                onCheckedChange={(checked) => handleInputChange("canEdit", !!checked)}
              />
              <Label htmlFor="canEdit" className="text-sm font-medium">
                Düzenleme İzni
              </Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="canDelete"
                checked={formData.canDelete}
                onCheckedChange={(checked) => handleInputChange("canDelete", !!checked)}
              />
              <Label htmlFor="canDelete" className="text-sm font-medium">
                Silme İzni
              </Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sayfa Erişim Yetkileri */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Sayfa Erişim Yetkileri
            </CardTitle>
            <div className="flex gap-2">
              <Button type="button" variant="outline" size="sm" onClick={selectBasicPages}>
                Temel Yetkiler
              </Button>
              <Button type="button" variant="outline" size="sm" onClick={selectAllPages}>
                Tümünü Seç
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {availablePages.map((page) => (
              <div
                key={page.id}
                className={`p-3 border rounded-lg transition-all cursor-pointer ${
                  selectedPages.includes(page.id)
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
                onClick={() => togglePage(page.id)}
              >
                <div className="flex items-start space-x-3">
                  <Checkbox
                    id={`page-${page.id}`}
                    checked={selectedPages.includes(page.id)}
                    onCheckedChange={() => togglePage(page.id)}
                    disabled={page.id === "dashboard"}
                  />
                  <div className="space-y-1 flex-1">
                    <Label
                      htmlFor={`page-${page.id}`}
                      className="text-sm font-medium cursor-pointer flex items-center gap-2"
                    >
                      <span>{page.icon}</span>
                      {page.label}
                      {page.id === "dashboard" && <span className="text-xs text-muted-foreground">(Zorunlu)</span>}
                    </Label>
                    <p className="text-xs text-muted-foreground">{page.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 p-3 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground">
              <strong>Seçili Sayfalar:</strong> {selectedPages.length} sayfa
              {selectedPages.length > 0 && (
                <span className="ml-2">
                  ({selectedPages.map(id => availablePages.find(p => p.id === id)?.label).join(", ")})
                </span>
              )}
            </p>
          </div>
        </CardContent>
      </Card>

      <Separator />

      <Button type="submit" disabled={loading} className="w-full md:w-auto">
        {loading ? (
          <>
            <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
            Oluşturuluyor...
          </>
        ) : (
          "Kullanıcı Oluştur"
        )}
      </Button>
    </form>
  );
};

export default CreateUserForm;
