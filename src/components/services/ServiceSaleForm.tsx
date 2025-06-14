import React, { useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { getCustomers, getServices, createCustomerRecord, type Customer, type Service, addServiceSale, addCustomerRecord } from '@/utils/storage';

interface ServiceSaleFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

const ServiceSaleForm = ({ onSuccess, onCancel }: ServiceSaleFormProps) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchCustomersAndServices = async () => {
      const fetchedCustomers = await getCustomers();
      const fetchedServices = await getServices();
      setCustomers(fetchedCustomers);
      setServices(fetchedServices);
    };

    fetchCustomersAndServices();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer || !selectedService) return;

    setIsSubmitting(true);

    try {
      // Create service sale record
      const serviceSale: ServiceSale = {
        id: Date.now(),
        serviceId: selectedService.id,
        serviceName: selectedService.name,
        price: selectedService.price,
        saleDate: new Date(),
        customerId: selectedCustomer.id,
        customerName: selectedCustomer.name,
        customerPhone: selectedCustomer.phone,
      };

      await addServiceSale(serviceSale);

      // Create customer record for the service
      const customerRecord: CustomerRecord = {
        id: Date.now() + 1,
        customerId: selectedCustomer.id,
        type: 'service',
        itemId: selectedService.id,
        itemName: selectedService.name,
        amount: selectedService.price,
        date: new Date(),
        isPaid: false,
        description: `${selectedService.name} hizmeti`,
        recordType: 'debt',
        createdAt: new Date(),
      };

      await addCustomerRecord(customerRecord);

      toast({
        title: "Hizmet satışı kaydedildi",
        description: `${selectedService.name} hizmeti ${selectedCustomer.name} için kaydedildi.`,
      });

      setSelectedCustomer(null);
      setSelectedService(null);

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Hizmet satışı kaydedilirken hata:", error);
      toast({
        variant: "destructive",
        title: "Hata",
        description: "Hizmet satışı kaydedilirken bir hata oluştu.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>Hizmet Satışı Ekle</DialogTitle>
        <DialogDescription>
          Müşteriye hizmet satışı eklemek için aşağıdaki alanları kullanın.
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="customer">Müşteri</Label>
          <Select onValueChange={(value) => setSelectedCustomer(customers.find(c => c.id === parseInt(value)) || null)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Müşteri seçin" />
            </SelectTrigger>
            <SelectContent>
              {customers.map((customer) => (
                <SelectItem key={customer.id} value={customer.id.toString()}>
                  {customer.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="service">Hizmet</Label>
          <Select onValueChange={(value) => setSelectedService(services.find(s => s.id === parseInt(value)) || null)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Hizmet seçin" />
            </SelectTrigger>
            <SelectContent>
              {services.map((service) => (
                <SelectItem key={service.id} value={service.id.toString()}>
                  {service.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Tarih</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, "PPP") : <span>Tarih seçin</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="center" side="bottom">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                disabled={(date) =>
                  date > new Date()
                }
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        <DialogFooter className="pt-4">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              İptal
            </Button>
          )}
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Kaydediliyor...' : 'Kaydet'}
          </Button>
        </DialogFooter>
      </form>
    </>
  );
};

export default ServiceSaleForm;
