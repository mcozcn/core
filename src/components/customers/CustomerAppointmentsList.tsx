import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";

interface CustomerAppointmentsListProps {
  appointments: Array<{
    id: number;
    date: string;
    time: string;
    service: string;
    status: 'pending' | 'confirmed' | 'cancelled';
    note?: string;
    cancellationNote?: string;
  }>;
}

const CustomerAppointmentsList = ({ appointments }: CustomerAppointmentsListProps) => {
  const sortedAppointments = [...appointments].sort((a, b) => {
    const dateA = new Date(`${a.date}T${a.time}`);
    const dateB = new Date(`${b.date}T${b.time}`);
    return dateB.getTime() - dateA.getTime();
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline">Bekliyor</Badge>;
      case 'confirmed':
        return <Badge variant="default" className="bg-green-500">Onaylandı</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">İptal Edildi</Badge>;
      default:
        return null;
    }
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Tarih</TableHead>
          <TableHead>Saat</TableHead>
          <TableHead>Hizmet</TableHead>
          <TableHead>Durum</TableHead>
          <TableHead>Not</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sortedAppointments.length === 0 ? (
          <TableRow>
            <TableCell colSpan={5} className="text-center text-muted-foreground">
              Henüz randevu bulunmamaktadır.
            </TableCell>
          </TableRow>
        ) : (
          sortedAppointments.map((appointment) => (
            <TableRow key={appointment.id}>
              <TableCell>
                {format(new Date(appointment.date), 'PPP', { locale: tr })}
              </TableCell>
              <TableCell>{appointment.time}</TableCell>
              <TableCell>{appointment.service}</TableCell>
              <TableCell>{getStatusBadge(appointment.status)}</TableCell>
              <TableCell>
                {appointment.status === 'cancelled' 
                  ? `İptal Nedeni: ${appointment.cancellationNote || 'Belirtilmedi'}`
                  : appointment.note || '-'}
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
};

export default CustomerAppointmentsList;