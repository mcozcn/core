import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { getAppointments, setAppointments, type Appointment, getCustomers, getServices } from "@/utils/localStorage";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import CustomerSelectionDialog from '../common/CustomerSelectionDialog';

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
          <CustomerSelectionDialog
            customers={customers}
            selectedCustomer={selectedCustomer}
            customerSearch={customerSearch}
            setCustomerSearch={setCustomerSearch}
            onCustomerSelect={(id) => setCustomerId(id)}
          />
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