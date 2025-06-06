
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/components/ui/use-toast";
import { addUser } from "@/utils/storage/users";

interface CreateUserFormProps {
  onSuccess: () => void;
}

const availablePages = [
  { id: "dashboard", label: "Ana Sayfa" },
  { id: "appointments", label: "Randevular" },
  { id: "customers", label: "Müşteriler" },
  { id: "services", label: "Hizmetler" },
  { id: "stock", label: "Stok Yönetimi" },
  { id: "sales", label: "Satışlar" },
  { id: "costs", label: "Masraflar" },
  { id: "financial", label: "Finansal Takip" },
  { id: "reports", label: "Raporlar" },
  { id: "backup", label: "Yedekleme" },
  { id: "personnel", label: "Personel Yönetimi" },
  { id: "performance", label: "Performans" },
];

const CreateUserForm = ({ onSuccess }: CreateUserFormProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [title, setTitle] = useState("");
  const [canEdit, setCanEdit] = useState(false);
  const [canDelete, setCanDelete] = useState(false);
  const [selectedPages, setSelectedPages] = useState<string[]>(["dashboard", "appointments", "customers"]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!username || !password || !displayName) {
        toast({
          variant: "destructive",
          title: "Hata",
          description: "Lütfen gerekli alanları doldurun.",
        });
        return;
      }

      console.log("Kullanıcı oluşturuluyor, izinli sayfalar:", selectedPages);

      await addUser({
        username,
        password,
        displayName,
        email: `${username}@example.com`,
        role: "staff",
        title: title || "Personel",
        color: '#6E59A5',
        allowedPages: selectedPages,
        canEdit,
        canDelete,
        createdAt: new Date(),
      });

      toast({
        title: "Başarılı",
        description: "Kullanıcı başarıyla oluşturuldu",
      });

      // Reset form
      setUsername("");
      setPassword("");
      setDisplayName("");
      setTitle("");
      setCanEdit(false);
      setCanDelete(false);
      setSelectedPages(["dashboard", "appointments", "customers"]);

      // Call success callback
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
    setSelectedPages((current) => {
      const newSelection = current.includes(pageId)
        ? current.filter((id) => id !== pageId)
        : [...current, pageId];
      
      console.log("Sayfa seçimi güncellendi:", pageId, newSelection);
      return newSelection;
    });
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="username">Kullanıcı Adı</Label>
              <Input
                id="username"
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
            
            <div className="space-y-2">
              <Label htmlFor="displayName">Görünen Ad</Label>
              <Input
                id="displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="title">Ünvan</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Örn: Kuaför, Resepsiyonist, vb."
              />
            </div>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-lg font-medium">İzinler</h3>
            
            <div className="flex flex-wrap gap-6">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="canEdit"
                  checked={canEdit}
                  onCheckedChange={(checked) => setCanEdit(!!checked)}
                />
                <Label htmlFor="canEdit">Düzenleme İzni</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="canDelete"
                  checked={canDelete}
                  onCheckedChange={(checked) => setCanDelete(!!checked)}
                />
                <Label htmlFor="canDelete">Silme İzni</Label>
              </div>
            </div>
            
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Erişim İzni Verilen Sayfalar</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                {availablePages.map((page) => (
                  <div key={page.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`page-${page.id}`}
                      checked={selectedPages.includes(page.id)}
                      onCheckedChange={() => togglePage(page.id)}
                    />
                    <Label htmlFor={`page-${page.id}`}>{page.label}</Label>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <Button type="submit" disabled={loading}>
            {loading ? "Kaydediliyor..." : "Kullanıcı Oluştur"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default CreateUserForm;
