
import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { getAppointments, setAppointments, type Appointment, getCustomers, getServices } from "@/utils/localStorage";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import CustomerSelectionDialog from '../common/CustomerSelectionDialog';
import { format } from 'date-fns';
import { getPersonnel, type Personnel } from '@/utils/storage/personnel';
import { CalendarIcon } from 'lucide-react';
import { cn } from "@/lib/utils";

interface AppointmentFormProps {
  selectedDate?: Date;
  onSuccess: () => void;
  onCancel: () => void;
}

// Combined type for staff selection
type StaffMember = {
  id: number;
  name: string;
  title: string;
  color: string;
  type: 'personnel' | 'user';
};

const AppointmentForm = ({ selectedDate: initialDate, onSuccess, onCancel }: AppointmentFormProps) => {
  const [customerId, setCustomerId] = useState('');
  const [customerSearch, setCustomerSearch] = useState('');
  const [appointmentTime, setAppointmentTime] = useState('');
  const [appointmentDate, setAppointmentDate] = useState<Date | undefined>(initialDate || new Date());
  const [serviceId, setServiceId] = useState('');
  const [staffId, setStaffId] = useState('');
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

  // Combine personnel into a unified staff list
  const allStaff: StaffMember[] = [
    ...personnel.map((person: Personnel) => ({
      id: person.id,
      name: person.name,
      title: person.title,
      color: person.color || '#3B82F6',
      type: 'personnel' as const
    }))
  ];
  
  const selectedCustomer = customers.find(c => c.id.toString() === customerId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!appointmentDate) {
      toast({
        variant: "destructive",
        title: "Hata",
        description: "Randevu tarihi seçmelisiniz.",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const appointments = getAppointments();
      const customer = customers.find(c => c.id === Number(customerId));
      const service = services.find(s => s.id === Number(serviceId));
      
      // Find staff member from combined list
      const selectedStaff = allStaff.find(s => s.id === Number(staffId));

      if (!customer) {
        throw new Error("Müşteri bulunamadı");
      }

      if (!service) {
        throw new Error("Hizmet bulunamadı");
      }

      if (!selectedStaff) {
        throw new Error("Personel bulunamadı");
      }

      const formattedDate = format(appointmentDate, 'yyyy-MM-dd');
      console.log('Selected date:', appointmentDate);
      console.log('Formatted date for appointment:', formattedDate);

      const newAppointment: Appointment = {
        id: Date.now(),
        customerId: Number(customerId),
        customerName: customer.name,
        serviceId: Number(serviceId),
        serviceName: service.name,
        service: service.name,
        staffId: Number(staffId),
        staffName: selectedStaff.name,
        staffColor: selectedStaff.color,
        date: formattedDate,
        startTime: appointmentTime,
        endTime: appointmentTime,
        time: appointmentTime,
        price: service.price,
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
          <Label>Randevu Tarihi</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !appointmentDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {appointmentDate ? format(appointmentDate, "dd/MM/yyyy") : "Tarih seçin"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 z-50" align="start">
              <Calendar
                mode="single"
                selected={appointmentDate}
                onSelect={setAppointmentDate}
                initialFocus
                className="rounded-md border pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </div>

        <div>
          <Label>Personel</Label>
          <Select value={staffId} onValueChange={setStaffId}>
            <SelectTrigger>
              <SelectValue placeholder="Personel seçin" />
            </SelectTrigger>
            <SelectContent className="z-50">
              {allStaff.map((person) => (
                <SelectItem 
                  key={person.id} 
                  value={person.id.toString()}
                  className="flex items-center gap-2"
                >
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: person.color }}
                    />
                    {person.name} - {person.title}
                  </div>
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
            <SelectContent className="z-50">
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
