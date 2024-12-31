import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import CustomerSelect from "@/components/common/CustomerSelect";
import { getAppointments, setAppointments, type Appointment } from "@/utils/localStorage";

interface AppointmentFormProps {
  selectedDate: Date;
  onSuccess: () => void;
  onCancel: () => void;
}

const AppointmentForm = ({ selectedDate, onSuccess, onCancel }: AppointmentFormProps) => {
  const [customerId, setCustomerId] = useState('');
  const [appointmentTime, setAppointmentTime] = useState('');
  const [service, setService] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const appointments = getAppointments();
      const newAppointment: Appointment = {
        id: Date.now(),
        customerId: Number(customerId),
        date: selectedDate.toISOString().split('T')[0],
        time: appointmentTime,
        service,
        status: 'pending',
        createdAt: new Date(),
      };
      
      const updatedAppointments = [...appointments, newAppointment];
      setAppointments(updatedAppointments);
      queryClient.setQueryData(['appointments'], updatedAppointments);
      
      console.log('New appointment saved:', newAppointment);
      
      toast({
        title: "Randevu başarıyla kaydedildi",
        description: `${service} için randevu oluşturuldu.`,
      });

      onSuccess();
    } catch (error) {
      console.error('Error saving appointment:', error);
      toast({
        variant: "destructive",
        title: "Hata!",
        description: "Randevu kaydedilirken bir hata oluştu. Lütfen tekrar deneyin.",
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
          <CustomerSelect
            value={customerId}
            onValueChange={setCustomerId}
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
          <Input 
            value={service}
            onChange={(e) => setService(e.target.value)}
            placeholder="Alınacak hizmeti girin"
            required
          />
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