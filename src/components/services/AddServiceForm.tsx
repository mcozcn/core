
import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/components/ui/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { getServices, setServices, type Service } from "@/utils/localStorage";

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
    price: '',
    description: '',
    duration: '',
    type: 'one-time' as 'recurring' | 'one-time',
    sessionCount: '1',
    commissionRate: '0',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const newService: Service = {
        id: services.length + 1,
        name: formData.name,
        price: Number(formData.price),
        description: formData.description,
        duration: formData.duration, // Allow string for duration
        type: formData.type,
        sessionCount: Number(formData.sessionCount),
        commissionRate: Number(formData.commissionRate),
        createdAt: new Date(),
      };

      const updatedServices = [...services, newService];
      setServices(updatedServices);
      queryClient.setQueryData(['services'], updatedServices);

      toast({
        title: "Başarıyla kaydedildi",
        description: `${newService.name} hizmet listenize eklendi.`,
      });

      setFormData({
        name: '',
        price: '',
        description: '',
        duration: '',
        type: 'one-time',
        sessionCount: '1',
        commissionRate: '0',
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
          <Label>İsim</Label>
          <Input
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Hizmet adını girin"
            required
          />
        </div>

        <div>
          <Label>Fiyat (₺)</Label>
          <Input
            type="number"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
            placeholder="Fiyat girin"
            required
          />
        </div>

        <div>
          <Label>Süre (dk)</Label>
          <Input
            value={formData.duration}
            onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
            placeholder="Hizmet süresini girin"
          />
        </div>

        <div>
          <Label>Komisyon Oranı (%)</Label>
          <Input
            type="number"
            min="0"
            max="100"
            value={formData.commissionRate}
            onChange={(e) => setFormData({ ...formData, commissionRate: e.target.value })}
            placeholder="Komisyon oranı girin"
          />
        </div>

        <div>
          <Label>Seans Sayısı</Label>
          <Input
            type="number"
            min="1"
            value={formData.sessionCount}
            onChange={(e) => setFormData({ ...formData, sessionCount: e.target.value })}
            placeholder="Seans sayısını girin"
            required
          />
        </div>

        <div>
          <Label>Hizmet Tipi</Label>
          <RadioGroup
            value={formData.type}
            onValueChange={(value) => setFormData({ ...formData, type: value as 'recurring' | 'one-time' })}
            className="flex space-x-4 mt-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="recurring" id="recurring" />
              <Label htmlFor="recurring">Sürekli</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="one-time" id="one-time" />
              <Label htmlFor="one-time">Tek Seferlik</Label>
            </div>
          </RadioGroup>
        </div>

        <div>
          <Label>Açıklama</Label>
          <Textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Açıklama girin"
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
