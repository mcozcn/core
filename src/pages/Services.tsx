import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Service {
  id: number;
  name: string;
  type: 'service' | 'product';
  price: number;
  description: string;
  duration?: string;
  createdAt: Date;
}

const Services = () => {
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [services, setServices] = useState<Service[]>([]);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    type: 'service',
    price: '',
    description: '',
    duration: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const newService: Service = {
        id: services.length + 1,
        name: formData.name,
        type: formData.type as 'service' | 'product',
        price: Number(formData.price),
        description: formData.description,
        duration: formData.type === 'service' ? formData.duration : undefined,
        createdAt: new Date(),
      };

      await new Promise(resolve => setTimeout(resolve, 1000));
      setServices(prev => [...prev, newService]);

      toast({
        title: "Başarıyla kaydedildi",
        description: `${newService.name} hizmet listenize eklendi.`,
      });

      setFormData({
        name: '',
        type: 'service',
        price: '',
        description: '',
        duration: '',
      });
      setShowForm(false);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Hata!",
        description: "Kayıt sırasında bir hata oluştu. Lütfen tekrar deneyin.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-8 pl-72 animate-fadeIn">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-4xl font-serif">Hizmet ve Ürün Yönetimi</h1>
        <Button onClick={() => setShowForm(true)} className="flex items-center gap-2">
          Yeni Ekle
        </Button>
      </div>

      {showForm && (
        <Card className="p-6 mb-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Tür</Label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="service">Hizmet</option>
                <option value="product">Ürün</option>
              </select>
            </div>

            <div>
              <Label>İsim</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Hizmet/Ürün adını girin"
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

            {formData.type === 'service' && (
              <div>
                <Label>Süre (dk)</Label>
                <Input
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  placeholder="Hizmet süresini girin"
                />
              </div>
            )}

            <div>
              <Label>Açıklama</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Açıklama girin"
              />
            </div>

            <div className="flex gap-2">
              <Button
                type="submit"
                className="flex-1"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Kaydediliyor..." : "Kaydet"}
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
      )}

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tür</TableHead>
              <TableHead>İsim</TableHead>
              <TableHead>Fiyat</TableHead>
              <TableHead>Süre</TableHead>
              <TableHead>Açıklama</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {services.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  Henüz hizmet/ürün kaydı bulunmamaktadır.
                </TableCell>
              </TableRow>
            ) : (
              services.map((service) => (
                <TableRow key={service.id}>
                  <TableCell>{service.type === 'service' ? 'Hizmet' : 'Ürün'}</TableCell>
                  <TableCell>{service.name}</TableCell>
                  <TableCell>{service.price} ₺</TableCell>
                  <TableCell>{service.duration || '-'}</TableCell>
                  <TableCell>{service.description}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};

export default Services;