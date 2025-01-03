import React, { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { getAppointments, setAppointments, type Appointment, getCustomers, getServices } from "@/utils/localStorage";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Search } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface AppointmentFormProps {
  selectedDate: Date;
  onSuccess: () => void;
  onCancel: () => void;
}

const AppointmentForm = ({ selectedDate, onSuccess, onCancel }: AppointmentFormProps) => {
  const [customerId, setCustomerId] = useState('');
  const [customerSearch, setCustomerSearch] = useState('');
  const [appointmentTime, setAppointmentTime] = useState('');
  const [serviceId, setServiceId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: services = [] } = useQuery({
    queryKey: ['services'],
    queryFn: getServices,
  });

  const { data: customers = [] } = useQuery({
    queryKey: ['customers'],
    queryFn: getCustomers,
  });

  const filteredCustomers = customers.filter(customer => 
    customer.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
    customer.phone.includes(customerSearch)
  );

  const selectedCustomer = customers.find(c => c.id.toString() === customerId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const appointments = getAppointments();
      const customer = customers.find(c => c.id === Number(customerId));
      const service = services.find(s => s.id === Number(serviceId));

      if (!customer) {
        throw new Error("Müşteri bulunamadı");
      }

      if (!service) {
        throw new Error("Hizmet bulunamadı");
      }

      const newAppointment: Appointment = {
        id: Date.now(),
        customerId: Number(customerId),
        customerName: customer.name,
        date: selectedDate.toISOString().split('T')[0],
        time: appointmentTime,
        service: service.name,
        status: 'pending',
        createdAt: new Date(),
      };
      
      const updatedAppointments = [...appointments, newAppointment];
      setAppointments(updatedAppointments);
      queryClient.setQueryData(['appointments'], updatedAppointments);
      
      console.log('New appointment saved:', newAppointment);
      
      toast({
        title: "Randevu başarıyla kaydedildi",
        description: `${service.name} için randevu oluşturuldu.`,
      });

      onSuccess();
    } catch (error) {
      console.error('Error saving appointment:', error);
      toast({
        variant: "destructive",
        title: "Hata!",
        description: error instanceof Error ? error.message : "Randevu kaydedilirken bir hata oluştu.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label>Müşteri</Label>
          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-between"
                type="button"
              >
                {selectedCustomer ? (
                  <span>{selectedCustomer.name} - {selectedCustomer.phone}</span>
                ) : (
                  <span>Müşteri seçin...</span>
                )}
                <Search className="ml-2 h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Müşteri Seç</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <Input
                  placeholder="Müşteri ara..."
                  value={customerSearch}
                  onChange={(e) => setCustomerSearch(e.target.value)}
                />
                <ScrollArea className="h-[300px]">
                  <div className="space-y-2">
                    {filteredCustomers.map((customer) => (
                      <Button
                        key={customer.id}
                        variant="ghost"
                        className="w-full justify-start"
                        onClick={() => {
                          setCustomerId(customer.id.toString());
                          setCustomerSearch('');
                        }}
                      >
                        <div className="text-left">
                          <div>{customer.name}</div>
                          <div className="text-sm text-muted-foreground">{customer.phone}</div>
                        </div>
                      </Button>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div>
          <Label>Randevu Saati</Label>
          <Input 
            type="time"
            value={appointmentTime}
            onChange={(e) => setAppointmentTime(e.target.value)}
            required
          />
        </div>

        <div>
          <Label>Hizmet</Label>
          <Select value={serviceId} onValueChange={setServiceId}>
            <SelectTrigger>
              <SelectValue placeholder="Hizmet seçin" />
            </SelectTrigger>
            <SelectContent>
              {services.map((service) => (
                <SelectItem key={service.id} value={service.id.toString()}>
                  {service.name} - {service.price} ₺
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-2">
          <Button 
            type="submit" 
            className="flex-1"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Kaydediliyor..." : "Randevuyu Kaydet"}
          </Button>
          <Button 
            type="button" 
            variant="outline"
            onClick={onCancel}
          >
            İptal
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default AppointmentForm;