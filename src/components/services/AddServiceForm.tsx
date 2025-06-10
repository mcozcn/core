import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { getServices, setServices, type Service } from "@/utils/localStorage";
import { Textarea } from "@/components/ui/textarea";

interface AddServiceFormProps {
  showForm: boolean;
  setShowForm: (show: boolean) => void;
  services: Service[];
}

const AddServiceForm = ({ showForm, setShowForm, services }: AddServiceFormProps) => {
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
      const newService: Service = {
        id: Date.now(),
        name: formData.name,
        description: formData.description,
        price: Number(formData.price),
        duration: Number(formData.duration),
      };

      const updatedServices = [...services, newService];
      setServices(updatedServices);
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
      setShowForm(false);
    } catch (error) {
      console.error('Error saving service:', error);
      toast({
        variant: "destructive",
        title: "Hata!",
        description: "Kayıt sırasında bir hata oluştu. Lütfen tekrar deneyin.",
      });
    }
  };

  if (!showForm) return null;

  return (
    <Card className="p-6 mb-8">
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
            onClick={() => setShowForm(false)}
          >
            İptal
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default AddServiceForm;
