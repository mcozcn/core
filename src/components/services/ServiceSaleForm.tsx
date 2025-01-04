import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { getServiceSales, setServiceSales, getServices, getCustomers, type Service, type ServiceSale, setCustomerRecords, getCustomerRecords, type CustomerRecord } from "@/utils/localStorage";
import { useQuery } from "@tanstack/react-query";
import CustomerSelectionDialog from '../common/CustomerSelectionDialog';

interface ServiceSaleFormProps {
  showForm: boolean;
  setShowForm: (show: boolean) => void;
  services: Service[];
  sales: ServiceSale[];
}

const ServiceSaleForm = ({ showForm, setShowForm, services, sales }: ServiceSaleFormProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [customerSearch, setCustomerSearch] = useState('');
  const [saleData, setSaleData] = useState({
    serviceId: '',
    customerId: '',
  });

  const { data: customers = [] } = useQuery({
    queryKey: ['customers'],
    queryFn: () => {
      console.log('Fetching customers for service sale form');
      return getCustomers();
    },
  });

  const selectedCustomer = customers.find(c => c.id.toString() === saleData.customerId);

  const handleSale = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const service = services.find(item => item.id === Number(saleData.serviceId));
      const customer = customers.find(c => c.id === Number(saleData.customerId));
      
      if (!service) {
        throw new Error("Hizmet bulunamadı");
      }

      if (!customer) {
        throw new Error("Müşteri bulunamadı");
      }

      const newSale: ServiceSale = {
        id: Date.now(),
        serviceId: service.id,
        serviceName: service.name,
        price: service.price,
        customerName: customer.name,
        customerPhone: customer.phone,
        saleDate: new Date(),
      };

      // Update sales
      const updatedSales = [...sales, newSale];
      setServiceSales(updatedSales);
      queryClient.setQueryData(['serviceSales'], updatedSales);

      // Add to customer records
      const newRecord: CustomerRecord = {
        id: Date.now(),
        customerId: Number(saleData.customerId),
        type: 'service',
        itemId: service.id,
        itemName: service.name,
        amount: service.price,
        date: new Date(),
        isPaid: false,
        description: `Hizmet satışı: ${service.name}`,
        recordType: 'debt'
      };

      const existingRecords = getCustomerRecords();
      setCustomerRecords([...existingRecords, newRecord]);
      queryClient.invalidateQueries({ queryKey: ['customerRecords'] });

      console.log('Service sale completed:', newSale);
      console.log('Customer record added:', newRecord);

      toast({
        title: "Satış başarılı",
        description: `${service.name} satışı gerçekleştirildi.`,
      });

      setSaleData({
        serviceId: '',
        customerId: '',
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
          <Label>Müşteri</Label>
          <CustomerSelectionDialog
            customers={customers}
            selectedCustomer={selectedCustomer}
            customerSearch={customerSearch}
            setCustomerSearch={setCustomerSearch}
            onCustomerSelect={(customerId) => setSaleData(prev => ({ ...prev, customerId }))}
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