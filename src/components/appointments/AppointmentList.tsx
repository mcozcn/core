import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/components/ui/use-toast";
import { getAppointments, setAppointments, type Appointment } from "@/utils/localStorage";

interface AppointmentListProps {
  appointments: Appointment[];
  selectedDate?: Date;
}

const AppointmentList = ({ appointments, selectedDate }: AppointmentListProps) => {
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

  const filteredAppointments = selectedDate 
    ? appointments.filter(apt => apt.date === selectedDate.toISOString().split('T')[0])
    : appointments;

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Müşteri</TableHead>
          <TableHead>Tarih</TableHead>
          <TableHead>Saat</TableHead>
          <TableHead>Hizmet</TableHead>
          <TableHead>Durum</TableHead>
          <TableHead>İşlemler</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {filteredAppointments.length === 0 ? (
          <TableRow>
            <TableCell colSpan={6} className="text-center text-muted-foreground">
              {selectedDate 
                ? "Seçili tarihte randevu bulunmamaktadır."
                : "Henüz randevu kaydı bulunmamaktadır."}
            </TableCell>
          </TableRow>
        ) : (
          filteredAppointments.map((appointment) => (
            <TableRow key={appointment.id}>
              <TableCell>{appointment.customerName}</TableCell>
              <TableCell>{appointment.date}</TableCell>
              <TableCell>{appointment.time}</TableCell>
              <TableCell>{appointment.service}</TableCell>
              <TableCell>
                <Badge variant={
                  appointment.status === 'confirmed' ? 'secondary' :
                  appointment.status === 'cancelled' ? 'destructive' :
                  'default'
                }>
                  {appointment.status === 'confirmed' ? 'Onaylandı' :
                   appointment.status === 'cancelled' ? 'İptal Edildi' :
                   'Beklemede'}
                </Badge>
              </TableCell>
              <TableCell>
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
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
};

export default AppointmentList;