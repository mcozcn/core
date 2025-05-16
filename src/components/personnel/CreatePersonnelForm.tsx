
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { register } from "@/utils/auth";
import { UserPlus } from "lucide-react";
import { Label } from "@/components/ui/label";
import { HexColorPicker } from "react-colorful";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";

const CreatePersonnelForm = ({ onSuccess }: { onSuccess: () => void }) => {
  const [displayName, setDisplayName] = useState("");
  const [title, setTitle] = useState("");
  const [selectedColor, setSelectedColor] = useState("#9b87f5");
  const [showColorPicker, setShowColorPicker] = useState(false);
  const { toast } = useToast();

  const handleCreatePersonnel = () => {
    if (!displayName || !title) {
      toast({
        variant: "destructive",
        title: "Hata",
        description: "Tüm alanları doldurun",
      });
      return;
    }

    const newPersonnel = register(
      displayName,
      title,
      'staff',
      selectedColor,
      ['dashboard', 'appointments', 'customers']
    );

    if (newPersonnel) {
      toast({
        title: "Başarılı",
        description: "Personel başarıyla oluşturuldu",
      });
      setDisplayName("");
      setTitle("");
      onSuccess();
    }
  };

  return (
    <div className="space-y-4">
      <DialogHeader>
        <DialogTitle>Yeni Personel Ekle</DialogTitle>
      </DialogHeader>
      
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="displayName">Personel Adı Soyadı</Label>
          <Input
            id="displayName"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Personelin adı ve soyadı"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="title">Ünvan</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Örn: Kuaför, Makyöz, vb."
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

        <Button onClick={handleCreatePersonnel} className="w-full">
          <UserPlus className="mr-2 h-4 w-4" />
          Personel Oluştur
        </Button>
      </div>
    </div>
  );
};

export default CreatePersonnelForm;
