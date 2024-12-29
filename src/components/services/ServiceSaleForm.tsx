import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { getServiceSales, setServiceSales, getServices, type Service, type ServiceSale } from "@/utils/localStorage";

interface ServiceSaleFormProps {
  showForm: boolean;
  setShowForm: (show: boolean) => void;
  services: Service[];
  sales: ServiceSale[];
}

const ServiceSaleForm = ({ showForm, setShowForm, services, sales }: ServiceSaleFormProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [saleData, setSaleData] = useState({
    serviceId: '',
    customerName: '',
    customerPhone: '',
  });

  const handleSale = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const service = services.find(item => item.id === Number(saleData.serviceId));
      
      if (!service) {
        throw new Error("Hizmet bulunamadı");
      }

      const newSale: ServiceSale = {
        id: Date.now(),
        serviceId: service.id,
        serviceName: service.name,
        price: service.price,
        customerName: saleData.customerName,
        customerPhone: saleData.customerPhone,
        saleDate: new Date(),
      };

      // Update sales
      const updatedSales = [...sales, newSale];
      setServiceSales(updatedSales);
      queryClient.setQueryData(['serviceSales'], updatedSales);

      console.log('Service sale completed:', newSale);

      toast({
        title: "Satış başarılı",
        description: `${service.name} satışı gerçekleştirildi.`,
      });

      setSaleData({
        serviceId: '',
        customerName: '',
        customerPhone: '',
      });
      setShowForm(false);
    } catch (error) {
      console.error('Error processing sale:', error);
      toast({
        variant: "destructive",
        title: "Hata!",
        description: error instanceof Error ? error.message : "Satış işlemi sırasında bir hata oluştu.",
      });
    }
  };

  if (!showForm) return null;

  return (
    <Card className="p-6 mb-8">
      <form onSubmit={handleSale} className="space-y-4">
        <div>
          <Label>Hizmet</Label>
          <select
            value={saleData.serviceId}
            onChange={(e) => setSaleData({ ...saleData, serviceId: e.target.value })}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2"
            required
          >
            <option value="">Hizmet seçin</option>
            {services.map((service) => (
              <option key={service.id} value={service.id}>
                {service.name} - {service.price} ₺
              </option>
            ))}
          </select>
        </div>

        <div>
          <Label>Müşteri Adı</Label>
          <Input
            value={saleData.customerName}
            onChange={(e) => setSaleData({ ...saleData, customerName: e.target.value })}
            placeholder="Müşteri adını girin"
            required
          />
        </div>

        <div>
          <Label>Müşteri Telefonu</Label>
          <Input
            value={saleData.customerPhone}
            onChange={(e) => setSaleData({ ...saleData, customerPhone: e.target.value })}
            placeholder="Müşteri telefonunu girin"
            required
          />
        </div>

        <div className="flex gap-2">
          <Button type="submit" className="flex-1">
            Satışı Tamamla
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

export default ServiceSaleForm;