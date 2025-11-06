
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
import DateSelectionDialog from '../common/DateSelectionDialog';
import { format } from 'date-fns';
import { getPersonnel } from '@/utils/storage/personnel';

interface AppointmentFormProps {
  selectedDate: Date;
  onSuccess: () => void;
  onCancel: () => void;
  appointment?: Appointment | null;
}

const AppointmentForm = ({ selectedDate, onSuccess, onCancel, appointment }: AppointmentFormProps) => {
  const isEditMode = !!appointment;
  const [customerId, setCustomerId] = useState(appointment?.customerId?.toString() || '');
  const [customerSearch, setCustomerSearch] = useState('');
  const [appointmentDate, setAppointmentDate] = useState<Date>(appointment ? new Date(appointment.date) : selectedDate);
  const [appointmentTime, setAppointmentTime] = useState(appointment?.time || appointment?.startTime || '');
  const [serviceId, setServiceId] = useState(appointment?.serviceId?.toString() || '');
  const [staffId, setStaffId] = useState(appointment?.staffId?.toString() || '');
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

  const { data: personnel = [] } = useQuery({
    queryKey: ['personnel'],
    queryFn: getPersonnel,
  });

  // Aktif personeli filtrele
  const activePersonnel = personnel.filter(person => person.isActive);
  const selectedCustomer = customers.find(c => c.id.toString() === customerId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const appointments = await getAppointments();
      const customer = customers.find(c => c.id === Number(customerId));
      const service = services.find(s => s.id === Number(serviceId));
      const staff = activePersonnel.find(s => s.id === Number(staffId));

      if (!customer) {
        throw new Error("Müşteri bulunamadı");
      }

      if (!service) {
        throw new Error("Hizmet bulunamadı");
      }

      if (!staff) {
        throw new Error("Personel bulunamadı");
      }

      const formattedDate = format(appointmentDate, 'yyyy-MM-dd');

      let updatedAppointments: Appointment[];
      
      if (isEditMode && appointment) {
        // Düzenleme modu
        updatedAppointments = appointments.map(apt => 
          apt.id === appointment.id 
            ? {
                ...apt,
                customerId: Number(customerId),
                customerName: customer.name,
                serviceId: Number(serviceId),
                serviceName: service.name,
                service: service.name,
                staffId: Number(staffId),
                staffName: staff.name,
                staffColor: staff.color,
                date: formattedDate,
                startTime: appointmentTime,
                endTime: appointmentTime,
                time: appointmentTime,
                price: service.price,
              }
            : apt
        );
        
        toast({
          title: "Randevu güncellendi",
          description: `${service.name} için randevu güncellendi.`,
        });
      } else {
        // Yeni randevu modu
        const newAppointment: Appointment = {
          id: Date.now(),
          customerId: Number(customerId),
          customerName: customer.name,
          serviceId: Number(serviceId),
          serviceName: service.name,
          service: service.name,
          staffId: Number(staffId),
          staffName: staff.name,
          staffColor: staff.color,
          date: formattedDate,
          startTime: appointmentTime,
          endTime: appointmentTime,
          time: appointmentTime,
          price: service.price,
          status: 'pending',
          createdAt: new Date(),
        };
        
        updatedAppointments = [...appointments, newAppointment];
        
        toast({
          title: "Randevu başarıyla kaydedildi",
          description: `${service.name} için randevu oluşturuldu.`,
        });
      }
      
      setAppointments(updatedAppointments);
      queryClient.setQueryData(['appointments'], updatedAppointments);

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
          <Label>Randevu Tarihi</Label>
          <DateSelectionDialog
            selectedDate={appointmentDate}
            onDateSelect={setAppointmentDate}
          />
        </div>

        <div>
          <Label>Personel</Label>
          <Select value={staffId} onValueChange={setStaffId}>
            <SelectTrigger>
              <SelectValue placeholder="Personel seçin" />
            </SelectTrigger>
            <SelectContent>
              {activePersonnel.map((person) => (
                <SelectItem 
                  key={person.id} 
                  value={person.id.toString()}
                  className="flex items-center gap-2"
                >
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: person.color }}
                  />
                  {person.name} - {person.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
            {isSubmitting ? (isEditMode ? "Güncelleniyor..." : "Kaydediliyor...") : (isEditMode ? "Randevuyu Güncelle" : "Randevuyu Kaydet")}
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
