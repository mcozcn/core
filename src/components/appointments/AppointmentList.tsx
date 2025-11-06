
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
import { Ban, MessageSquare, Edit, Trash2 } from "lucide-react";
import { createAppointmentWhatsAppLink } from "@/utils/whatsapp";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface AppointmentListProps {
  searchTerm?: string;
  onEdit?: (appointment: any) => void;
}

const AppointmentList = ({ searchTerm = '', onEdit }: AppointmentListProps) => {
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
          status: 'cancelled' as const,
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

  const handleDeleteAppointment = (appointment: any) => {
    const updatedAppointments = appointments.filter(apt => apt.id !== appointment.id);
    setAppointments(updatedAppointments);
    queryClient.setQueryData(['appointments'], updatedAppointments);

    toast({
      title: "Randevu silindi",
      description: "Randevu başarıyla silindi.",
    });
  };

  const handleWhatsAppShare = (appointment: any) => {
    const customer = customers.find(c => c.id === appointment.customerId);
    if (!customer || !customer.phone) {
      toast({
        title: "Telefon Bilgisi Eksik",
        description: "Müşterinin telefon numarası bulunamadı.",
        variant: "destructive",
      });
      return;
    }

    const whatsappLink = createAppointmentWhatsAppLink(
      customer.phone,
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

  const filteredAppointments = appointments.filter(appointment => {
    const customer = customers.find(c => c.id === appointment.customerId);
    const customerName = customer?.name || '';
    return customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
           (appointment.serviceName || appointment.service || '').toLowerCase().includes(searchTerm.toLowerCase());
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
                    <TableCell>{appointment.serviceName || appointment.service}</TableCell>
                    <TableCell>{new Date(appointment.date).toLocaleDateString('tr-TR')}</TableCell>
                    <TableCell>{appointment.time || appointment.startTime}</TableCell>
                    <TableCell>
                      {appointment.cancellationNote ? 
                        `İptal Nedeni: ${appointment.cancellationNote}` : 
                        appointment.notes || '-'}
                    </TableCell>
                    <TableCell>
                      {appointment.status === 'cancelled' ? 
                        <span className="text-red-500">İptal Edildi</span> : 
                        <span className="text-green-500">Aktif</span>}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        {onEdit && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onEdit(appointment)}
                            title="Düzenle"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        )}
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-destructive hover:text-destructive"
                              title="Sil"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Randevuyu Sil</AlertDialogTitle>
                              <AlertDialogDescription>
                                Bu işlem geri alınamaz. Bu randevuyu kalıcı olarak silmek istediğinizden emin misiniz?
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>İptal</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => handleDeleteAppointment(appointment)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Sil
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                        {appointment.status !== 'cancelled' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleCancelAppointment(appointment)}
                          >
                            <Ban className="h-4 w-4 mr-1" />
                            İptal Et
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleWhatsAppShare(appointment)}
                          className="text-green-600 border-green-600 hover:bg-green-50"
                        >
                          <MessageSquare className="h-4 w-4 mr-1" />
                          WhatsApp
                        </Button>
                      </div>
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
