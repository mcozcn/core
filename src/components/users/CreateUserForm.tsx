import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/components/ui/use-toast";
import { register } from "@/utils/auth";
import { UserPlus } from "lucide-react";
import { Label } from "@/components/ui/label";
import { HexColorPicker } from "react-colorful";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const AVAILABLE_PAGES = [
  { id: "dashboard", label: "Panel" },
  { id: "appointments", label: "Randevular" },
  { id: "customers", label: "Müşteriler" },
  { id: "services", label: "Hizmetler" },
  { id: "stock", label: "Stok Yönetimi" },
  { id: "sales", label: "Satışlar" },
  { id: "costs", label: "Masraflar" },
  { id: "financial", label: "Finansal Takip" },
  { id: "backup", label: "Yedekleme" },
];

const CreateUserForm = ({ onSuccess }: { onSuccess: () => void }) => {
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [selectedColor, setSelectedColor] = useState("#aabbcc");
  const [selectedPages, setSelectedPages] = useState<string[]>(["dashboard"]);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const { toast } = useToast();

const handleCreateUser = () => {
  if (!newUsername || !newPassword || !displayName) {
    toast({
      variant: "destructive",
      title: "Hata",
      description: "Tüm alanları doldurun",
    });
    return;
  }

  const newUser = register(
    displayName,
    "Personel",
    "staff",
    selectedColor,
    selectedPages
  );

  if (newUser) {
    toast({
      title: "Başarılı",
      description: "Kullanıcı oluşturuldu",
    });
    setNewUsername("");
    setNewPassword("");
    setDisplayName("");
    setSelectedPages(["dashboard"]);
    onSuccess();
  }
};

  const handlePageToggle = (pageId: string) => {
    setSelectedPages(current =>
      current.includes(pageId)
        ? current.filter(id => id !== pageId)
        : [...current, pageId]
    );
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="username">Kullanıcı Adı</Label>
          <Input
            id="username"
            value={newUsername}
            onChange={(e) => setNewUsername(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Şifre</Label>
          <Input
            id="password"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="displayName">Görünen Ad</Label>
        <Input
          id="displayName"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="Personelin görünen adı"
        />
      </div>

      <div className="space-y-2">
        <Label>Personel Rengi</Label>
        <Popover open={showColorPicker} onOpenChange={setShowColorPicker}>
          <PopoverTrigger asChild>
            <Button 
              variant="outline" 
              className="w-full"
              style={{ backgroundColor: selectedColor }}
            >
              Renk Seç
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <HexColorPicker
              color={selectedColor}
              onChange={setSelectedColor}
            />
          </PopoverContent>
        </Popover>
      </div>
      
      <div className="space-y-2">
        <Label>Erişim İzinleri</Label>
        <div className="grid grid-cols-3 gap-2">
          {AVAILABLE_PAGES.map((page) => (
            <div key={page.id} className="flex items-center space-x-2">
              <Checkbox
                id={page.id}
                checked={selectedPages.includes(page.id)}
                onCheckedChange={() => handlePageToggle(page.id)}
              />
              <Label
                htmlFor={page.id}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {page.label}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <Button onClick={handleCreateUser} className="w-full">
        <UserPlus className="mr-2 h-4 w-4" />
        Personel Oluştur
      </Button>
    </div>
  );
};

export default CreateUserForm;
