
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { UserPlus } from "lucide-react";
import { Label } from "@/components/ui/label";
import { HexColorPicker } from "react-colorful";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { addPersonnel } from "@/utils/storage/personnel";

const CreatePersonnelForm = ({ onSuccess }: { onSuccess: () => void }) => {
  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [commissionRate, setCommissionRate] = useState("30");
  const [notes, setNotes] = useState("");
  const [selectedColor, setSelectedColor] = useState("#e11d48");
  const [showColorPicker, setShowColorPicker] = useState(false);
  const { toast } = useToast();

  const handleCreatePersonnel = async () => {
    if (!name || !title || !phone) {
      toast({
        variant: "destructive",
        title: "Hata",
        description: "Ad, ünvan ve telefon alanları zorunludur",
      });
      return;
    }

    try {
      await addPersonnel({
        name,
        title,
        phone,
        email: email || undefined,
        color: selectedColor,
        commissionRate: parseFloat(commissionRate),
        notes: notes || undefined,
        isActive: true
      });

      toast({
        title: "Başarılı",
        description: "Personel başarıyla eklendi",
      });
      
      // Reset form
      setName("");
      setTitle("");
      setPhone("");
      setEmail("");
      setCommissionRate("30");
      setNotes("");
      setSelectedColor("#e11d48");
      
      onSuccess();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Hata",
        description: "Personel eklenemedi",
      });
    }
  };

  return (
    <div className="space-y-4">
      <DialogHeader>
        <DialogTitle>Yeni Personel Ekle</DialogTitle>
      </DialogHeader>
      
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Personel Adı *</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Personelin adı ve soyadı"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="title">Uzmanlık/Ünvan *</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Örn: Kuaför, Makyöz, Estetisyen"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Telefon *</Label>
          <Input
            id="phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="0532 123 4567"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">E-posta</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="personel@salon.com"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="commissionRate">Komisyon Oranı (%)</Label>
          <Input
            id="commissionRate"
            type="number"
            value={commissionRate}
            onChange={(e) => setCommissionRate(e.target.value)}
            placeholder="30"
            min="0"
            max="100"
          />
        </div>

        <div className="space-y-2">
          <Label>Personel Rengi</Label>
          <Popover open={showColorPicker} onOpenChange={setShowColorPicker}>
            <PopoverTrigger asChild>
              <Button 
                variant="outline" 
                className="w-full justify-start"
              >
                <div 
                  className="w-4 h-4 rounded-full mr-2" 
                  style={{ backgroundColor: selectedColor }}
                />
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
          <Label htmlFor="notes">Notlar</Label>
          <Textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Personel hakkında ek bilgiler..."
          />
        </div>

        <Button onClick={handleCreatePersonnel} className="w-full">
          <UserPlus className="mr-2 h-4 w-4" />
          Personel Ekle
        </Button>
      </div>
    </div>
  );
};

export default CreatePersonnelForm;
