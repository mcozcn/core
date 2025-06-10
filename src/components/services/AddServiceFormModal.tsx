import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { getServices, setServices, type Service } from "@/utils/localStorage";
import { Textarea } from "@/components/ui/textarea";

interface AddServiceFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AddServiceFormModal = ({ open, onOpenChange }: AddServiceFormModalProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    duration: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const services = await getServices();
      const newService: Service = {
        id: Date.now(),
        name: formData.name,
        description: formData.description,
        price: Number(formData.price),
        duration: Number(formData.duration),
      };

      const updatedServices = [...services, newService];
      await setServices(updatedServices);
      queryClient.setQueryData(['services'], updatedServices);

      console.log('Service saved:', newService);

      toast({
        title: "Başarıyla kaydedildi",
        description: `${newService.name} hizmet listenize eklendi.`,
      });

      setFormData({
        name: '',
        description: '',
        price: '',
        duration: '',
      });
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving service:', error);
      toast({
        variant: "destructive",
        title: "Hata!",
        description: "Kayıt sırasında bir hata oluştu. Lütfen tekrar deneyin.",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Yeni Hizmet Ekle</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Hizmet Adı</Label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Hizmet adını girin"
              required
            />
          </div>

          <div>
            <Label>Açıklama</Label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Hizmet açıklamasını girin"
              className="min-h-[100px]"
            />
          </div>

          <div>
            <Label>Fiyat (₺)</Label>
            <Input
              type="number"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              placeholder="Hizmet fiyatını girin"
              required
            />
          </div>

          <div>
            <Label>Süre (dakika)</Label>
            <Input
              type="number"
              value={formData.duration}
              onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
              placeholder="Hizmet süresini girin"
              required
            />
          </div>

          <div className="flex gap-2">
            <Button type="submit" className="flex-1">
              Kaydet
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              İptal
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddServiceFormModal;
