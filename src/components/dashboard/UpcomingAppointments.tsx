import React from 'react';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/components/ui/use-toast";
import { getAppointments, setAppointments, type Appointment } from '@/utils/localStorage';

interface UpcomingAppointmentsProps {
  appointments: Appointment[];
}

const UpcomingAppointments = ({ appointments }: UpcomingAppointmentsProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleStatusChange = (appointmentId: number, newStatus: 'confirmed' | 'cancelled') => {
    const allAppointments = getAppointments();
    const updatedAppointments = allAppointments.map(apt => 
      apt.id === appointmentId ? { ...apt, status: newStatus } : apt
    );

    setAppointments(updatedAppointments);
    queryClient.setQueryData(['appointments'], updatedAppointments);

    toast({
      title: `Randevu ${newStatus === 'confirmed' ? 'onaylandı' : 'iptal edildi'}`,
      description: `Randevu durumu güncellendi.`,
    });
  };

  const upcomingAppointments = appointments
    .filter(apt => new Date(`${apt.date}T${apt.time}`) > new Date())
    .sort((a, b) => new Date(`${a.date}T${a.time}`).getTime() - new Date(`${b.date}T${b.time}`).getTime())
    .slice(0, 5);

  return (
    <Card className="p-6">
      <h2 className="text-xl font-serif mb-4">Yaklaşan Randevular</h2>
      <div className="space-y-4">
        {upcomingAppointments.map((appointment) => (
          <div key={appointment.id} className="flex items-center justify-between p-3 bg-accent rounded-lg">
            <div>
              <div className="font-medium">{appointment.customerName}</div>
              <div className="text-sm text-gray-500">
                {appointment.date} - {appointment.time}
              </div>
              <div className="text-sm text-primary">{appointment.service}</div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant={
                appointment.status === 'confirmed' ? 'success' :
                appointment.status === 'cancelled' ? 'destructive' :
                'default'
              }>
                {appointment.status === 'confirmed' ? 'Onaylandı' :
                 appointment.status === 'cancelled' ? 'İptal Edildi' :
                 'Beklemede'}
              </Badge>
              {appointment.status === 'pending' && (
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-green-600"
                    onClick={() => handleStatusChange(appointment.id, 'confirmed')}
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-red-600"
                    onClick={() => handleStatusChange(appointment.id, 'cancelled')}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        ))}
        {upcomingAppointments.length === 0 && (
          <div className="text-center text-muted-foreground">
            Yaklaşan randevu bulunmamaktadır.
          </div>
        )}
      </div>
    </Card>
  );
};

export default UpcomingAppointments;