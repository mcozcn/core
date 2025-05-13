
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
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { useState } from "react";
import { getAppointments, setAppointments } from "@/utils/localStorage";
import { useQueryClient } from "@tanstack/react-query";
import { MessageSquare } from "lucide-react";
import { createAppointmentWhatsAppLink } from "@/utils/whatsapp";

interface CustomerAppointmentsListProps {
  appointments: Array<{
    id: number;
    date: string;
    time: string;
    service: string;
    status: 'pending' | 'confirmed' | 'cancelled';
    note?: string;
    cancellationNote?: string;
    staffName: string;
  }>;
  customerPhone: string;
}

const CustomerAppointmentsList = ({ appointments, customerPhone }: CustomerAppointmentsListProps) => {
  const [selectedAppointment, setSelectedAppointment] = useState<number | null>(null);
  const [cancellationNote, setCancellationNote] = useState("");
  const [showCancellationDialog, setShowCancellationDialog] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const sortedAppointments = [...appointments].sort((a, b) => {
    const dateA = new Date(`${a.date}T${a.time}`);
    const dateB = new Date(`${b.date}T${b.time}`);
    return dateB.getTime() - dateA.getTime();
  });

  const handleCancelAppointment = () => {
    if (!selectedAppointment) return;

    const allAppointments = getAppointments();
    const updatedAppointments = allAppointments.map(apt => 
      apt.id === selectedAppointment 
        ? { ...apt, status: 'cancelled' as const, cancellationNote } 
        : apt
    );

    setAppointments(updatedAppointments);
    queryClient.setQueryData(['appointments'], updatedAppointments);

    toast({
      title: "Randevu iptal edildi",
      description: "Randevu başarıyla iptal edildi.",
    });

    setShowCancellationDialog(false);
    setCancellationNote("");
    setSelectedAppointment(null);
  };

  const handleWhatsAppShare = (appointment: any) => {
    if (!customerPhone) {
      toast({
        title: "Telefon Bilgisi Eksik",
        description: "Müşterinin telefon numarası bulunamadı.",
        variant: "destructive",
      });
      return;
    }

    const whatsappLink = createAppointmentWhatsAppLink(
      customerPhone,
      {
        service: appointment.service,
        date: appointment.date,
        time: appointment.time,
        staffName: appointment.staffName,
        status: appointment.status
      }
    );

    if (whatsappLink) {
      window.open(whatsappLink, '_blank');
    } else {
      toast({
        title: "Hata",
        description: "WhatsApp bağlantısı oluşturulamadı.",
        variant: "destructive",
      });
    }
  };

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
    <>
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
                <TableCell>
                  <div className="flex space-x-2">
                    {appointment.status === 'pending' && (
                      <Dialog open={showCancellationDialog} onOpenChange={setShowCancellationDialog}>
                        <DialogTrigger asChild>
                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={() => setSelectedAppointment(appointment.id)}
                          >
                            İptal Et
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Randevu İptali</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <Label htmlFor="cancellationNote">İptal Nedeni</Label>
                              <Textarea
                                id="cancellationNote"
                                value={cancellationNote}
                                onChange={(e) => setCancellationNote(e.target.value)}
                                placeholder="İptal nedenini yazın..."
                              />
                            </div>
                            <Button 
                              variant="destructive" 
                              onClick={handleCancelAppointment}
                              className="w-full"
                            >
                              Randevuyu İptal Et
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    )}
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="text-green-600 border-green-600 hover:bg-green-50"
                      onClick={() => handleWhatsAppShare(appointment)}
                    >
                      <MessageSquare className="h-4 w-4 mr-1" />
                      WhatsApp
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </>
  );
};

export default CustomerAppointmentsList;
