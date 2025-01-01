import React from 'react';
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useQuery } from "@tanstack/react-query";
import { getAppointments, getCustomers } from "@/utils/localStorage";

interface AppointmentListProps {
  searchTerm?: string;
}

const AppointmentList = ({ searchTerm = '' }: AppointmentListProps) => {
  const { data: appointments = [] } = useQuery({
    queryKey: ['appointments'],
    queryFn: getAppointments,
  });

  const { data: customers = [] } = useQuery({
    queryKey: ['customers'],
    queryFn: getCustomers,
  });

  const filteredAppointments = appointments.filter(appointment => {
    const customer = customers.find(c => c.id === appointment.customerId);
    const customerName = customer?.name || '';
    return customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
           appointment.service.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <Card>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Müşteri</TableHead>
            <TableHead>Hizmet</TableHead>
            <TableHead>Tarih</TableHead>
            <TableHead>Saat</TableHead>
            <TableHead>Not</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredAppointments.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-muted-foreground">
                {searchTerm ? 'Arama sonucu bulunamadı.' : 'Henüz randevu bulunmamaktadır.'}
              </TableCell>
            </TableRow>
          ) : (
            filteredAppointments.map((appointment) => {
              const customer = customers.find(c => c.id === appointment.customerId);
              return (
                <TableRow key={appointment.id}>
                  <TableCell>{customer?.name || 'Müşteri bulunamadı'}</TableCell>
                  <TableCell>{appointment.service}</TableCell>
                  <TableCell>{new Date(appointment.date).toLocaleDateString('tr-TR')}</TableCell>
                  <TableCell>{appointment.time}</TableCell>
                  <TableCell>{appointment.note || '-'}</TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </Card>
  );
};

export default AppointmentList;