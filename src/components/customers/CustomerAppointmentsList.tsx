
import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Appointment } from "@/utils/localStorage";
import AppointmentTableRow from "./appointments/AppointmentTableRow";

interface CustomerAppointmentsListProps {
  appointments: Appointment[];
  customerPhone: string;
}

const CustomerAppointmentsList = ({ appointments, customerPhone }: CustomerAppointmentsListProps) => {
  const sortedAppointments = [...appointments].sort((a, b) => {
    const timeA = a.time || a.startTime;
    const timeB = b.time || b.startTime;
    const dateA = new Date(`${a.date}T${timeA}`);
    const dateB = new Date(`${b.date}T${timeB}`);
    return dateB.getTime() - dateA.getTime();
  });

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Tarih</TableHead>
          <TableHead>Saat</TableHead>
          <TableHead>Hizmet</TableHead>
          <TableHead>Durum</TableHead>
          <TableHead>Not</TableHead>
          <TableHead>İşlemler</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sortedAppointments.length === 0 ? (
          <TableRow>
            <TableCell colSpan={6} className="text-center text-muted-foreground">
              Henüz randevu bulunmamaktadır.
            </TableCell>
          </TableRow>
        ) : (
          sortedAppointments.map((appointment) => (
            <AppointmentTableRow
              key={appointment.id}
              appointment={appointment}
              customerPhone={customerPhone}
            />
          ))
        )}
      </TableBody>
    </Table>
  );
};

export default CustomerAppointmentsList;
