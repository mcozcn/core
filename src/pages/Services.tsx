import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/components/ui/use-toast";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getServices, setServices, getServiceSales, type Service } from "@/utils/localStorage";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ServiceSaleForm from "@/components/services/ServiceSaleForm";
import ServiceSalesTable from "@/components/services/ServiceSalesTable";

const Services = () => {
  const [showForm, setShowForm] = useState(false);
  const [showSaleForm, setShowSaleForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: services = [] } = useQuery({
    queryKey: ['services'],
    queryFn: () => {
      console.log('Fetching services from local storage');
      return getServices();
    },
  });

  const { data: sales = [] } = useQuery({
    queryKey: ['serviceSales'],
    queryFn: () => {
      console.log('Fetching service sales from local storage');
      return getServiceSales();
    },
  });

  const [formData, setFormData] = useState({
    name: '',
    price: '',
    description: '',
    duration: '',
    type: 'one-time' as 'recurring' | 'one-time',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const newService: Service = {
        id: services.length + 1,
        name: formData.name,
        price: Number(formData.price),
        description: formData.description,
        duration: formData.duration,
        type: formData.type,
        createdAt: new Date(),
      };

      const updatedServices = [...services, newService];
      setServices(updatedServices);
      queryClient.setQueryData(['services'], updatedServices);

      console.log('Service saved to localStorage:', newService);

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
      });
      setShowForm(false);
    } catch (error) {
      console.error('Error saving service:', error);
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
        <h1 className="text-4xl font-serif">Hizmet Yönetimi</h1>
        <div className="space-x-2">
          <Button onClick={() => setShowSaleForm(true)} variant="outline">
            Satış Yap
          </Button>
          <Button onClick={() => setShowForm(true)}>
            Yeni Hizmet Ekle
          </Button>
        </div>
      </div>

      <ServiceSaleForm 
        showForm={showSaleForm} 
        setShowForm={setShowSaleForm} 
        services={services}
        sales={sales}
      />

      {showForm && (
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

      <Tabs defaultValue="services" className="space-y-4">
        <TabsList>
          <TabsTrigger value="services">Hizmetler</TabsTrigger>
          <TabsTrigger value="sales">Satışlar</TabsTrigger>
        </TabsList>

        <TabsContent value="services">
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>İsim</TableHead>
                  <TableHead>Fiyat</TableHead>
                  <TableHead>Süre</TableHead>
                  <TableHead>Tür</TableHead>
                  <TableHead>Açıklama</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {services.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground">
                      Henüz hizmet kaydı bulunmamaktadır.
                    </TableCell>
                  </TableRow>
                ) : (
                  services.map((service) => (
                    <TableRow key={service.id}>
                      <TableCell>{service.name}</TableCell>
                      <TableCell>{service.price} ₺</TableCell>
                      <TableCell>{service.duration || '-'}</TableCell>
                      <TableCell>{service.type === 'recurring' ? 'Sürekli' : 'Tek Seferlik'}</TableCell>
                      <TableCell>{service.description}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="sales">
          <Card>
            <ServiceSalesTable sales={sales} />
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Services;