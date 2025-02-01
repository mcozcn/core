import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getAppointments, getCustomers, setAppointments } from "@/utils/localStorage";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Ban } from "lucide-react";

interface AppointmentListProps {
  searchTerm?: string;
}

const AppointmentList = ({ searchTerm = '' }: AppointmentListProps) => {
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const [cancellationNote, setCancellationNote] = useState('');
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: appointments = [] } = useQuery({
    queryKey: ['appointments'],
    queryFn: getAppointments,
  });

  const { data: customers = [] } = useQuery({
    queryKey: ['customers'],
    queryFn: getCustomers,
  });

  const handleCancelAppointment = (appointment: any) => {
    setSelectedAppointment(appointment);
    setShowCancelDialog(true);
  };

  const confirmCancellation = () => {
    if (!selectedAppointment) return;

    const updatedAppointments = appointments.map(apt => {
      if (apt.id === selectedAppointment.id) {
        return {
          ...apt,
          status: 'cancelled',
          cancellationNote,
        };
      }
      return apt;
    });

    setAppointments(updatedAppointments);
    queryClient.setQueryData(['appointments'], updatedAppointments);

    toast({
      title: "Randevu iptal edildi",
      description: "Randevu başarıyla iptal edildi.",
    });

    setShowCancelDialog(false);
    setCancellationNote('');
    setSelectedAppointment(null);
  };

  const filteredAppointments = appointments.filter(appointment => {
    const customer = customers.find(c => c.id === appointment.customerId);
    const customerName = customer?.name || '';
    return customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
           appointment.service.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <>
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Müşteri</TableHead>
              <TableHead>Hizmet</TableHead>
              <TableHead>Tarih</TableHead>
              <TableHead>Saat</TableHead>
              <TableHead>Not</TableHead>
              <TableHead>Durum</TableHead>
              <TableHead>İşlemler</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAppointments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground">
                  {searchTerm ? 'Arama sonucu bulunamadı.' : 'Henüz randevu bulunmamaktadır.'}
                </TableCell>
              </TableRow>
            ) : (
              filteredAppointments.map((appointment) => {
                const customer = customers.find(c => c.id === appointment.customerId);
                return (
                  <TableRow key={appointment.id} className={appointment.status === 'cancelled' ? 'opacity-60' : ''}>
                    <TableCell>{customer?.name || 'Müşteri bulunamadı'}</TableCell>
                    <TableCell>{appointment.service}</TableCell>
                    <TableCell>{new Date(appointment.date).toLocaleDateString('tr-TR')}</TableCell>
                    <TableCell>{appointment.time}</TableCell>
                    <TableCell>
                      {appointment.cancellationNote ? 
                        `İptal Nedeni: ${appointment.cancellationNote}` : 
                        appointment.note || '-'}
                    </TableCell>
                    <TableCell>
                      {appointment.status === 'cancelled' ? 
                        <span className="text-red-500">İptal Edildi</span> : 
                        <span className="text-green-500">Aktif</span>}
                    </TableCell>
                    <TableCell>
                      {appointment.status !== 'cancelled' && (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleCancelAppointment(appointment)}
                        >
                          <Ban className="h-4 w-4 mr-1" />
                          İptal Et
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Randevu İptali</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">İptal Nedeni</label>
              <Textarea
                value={cancellationNote}
                onChange={(e) => setCancellationNote(e.target.value)}
                placeholder="İptal nedenini yazın..."
                className="min-h-[100px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCancelDialog(false)}>
              Vazgeç
            </Button>
            <Button variant="destructive" onClick={confirmCancellation}>
              İptal Et
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AppointmentList;