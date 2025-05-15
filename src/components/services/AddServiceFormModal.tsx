
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
import { X, Save, FileText } from "lucide-react";

interface AddServiceFormModalProps {
  showForm: boolean;
  setShowForm: (show: boolean) => void;
  services: Service[];
}

const AddServiceFormModal = ({ showForm, setShowForm, services }: AddServiceFormModalProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    description: '',
    duration: '',
    type: 'one-time' as 'recurring' | 'one-time',
    sessionCount: '1',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const newService: Service = {
        id: services.length + 1,
        name: formData.name,
        price: Number(formData.price),
        description: formData.description,
        duration: formData.duration,
        type: formData.type,
        sessionCount: Number(formData.sessionCount),
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <Card className="w-full max-w-2xl bg-white shadow-lg max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 z-10 bg-white border-b p-4 flex justify-between items-center">
          <h3 className="text-xl font-semibold flex items-center">
            <FileText className="mr-2 h-5 w-5" />
            Yeni Hizmet Ekle
          </h3>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setShowForm(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="p-4">
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

            <div className="grid grid-cols-2 gap-4">
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
            </div>

            <div className="grid grid-cols-2 gap-4">
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
            </div>

            <div>
              <Label>Açıklama</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Açıklama girin"
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button type="submit" className="flex-1">
                <Save className="mr-2 h-4 w-4" /> Kaydet
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowForm(false)}
              >
                <X className="mr-2 h-4 w-4" /> İptal
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
};

export default AddServiceFormModal;
