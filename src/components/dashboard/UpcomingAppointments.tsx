import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, X, MessageSquare } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/components/ui/use-toast";
import { getAppointments, setAppointments, type Appointment, getCustomers } from '@/utils/localStorage';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { createAppointmentWhatsAppLink } from '@/utils/whatsapp';

interface UpcomingAppointmentsProps {
  appointments: Appointment[];
}

const UpcomingAppointments = ({ appointments }: UpcomingAppointmentsProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [cancellationNote, setCancellationNote] = useState('');

  const handleStatusChange = (appointmentId: number, newStatus: 'confirmed' | 'cancelled') => {
    if (newStatus === 'cancelled') {
      const appointment = appointments.find(apt => apt.id === appointmentId);
      if (appointment) {
        setSelectedAppointment(appointment);
        setShowCancelDialog(true);
      }
      return;
    }

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

  const handleConfirmCancellation = () => {
    if (!selectedAppointment) return;

    const allAppointments = getAppointments();
    const updatedAppointments = allAppointments.map(apt => 
      apt.id === selectedAppointment.id 
        ? { ...apt, status: 'cancelled' as const, cancellationNote } 
        : apt
    );

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

  const handleWhatsAppShare = async (appointment: Appointment) => {
    const customers = await queryClient.fetchQuery({
      queryKey: ['customers'],
      queryFn: getCustomers,
    });

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
        service: appointment.serviceName || appointment.service || '',
        date: appointment.date,
        time: appointment.time || appointment.startTime,
        staffName: appointment.staffName || '',
        status: appointment.status || 'pending'
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

  const upcomingAppointments = appointments
    .filter(apt => {
      const aptTime = apt.time || apt.startTime;
      return new Date(`${apt.date}T${aptTime}`) > new Date();
    })
    .sort((a, b) => {
      const timeA = a.time || a.startTime;
      const timeB = b.time || b.startTime;
      return new Date(`${a.date}T${timeA}`).getTime() - new Date(`${b.date}T${timeB}`).getTime();
    })
    .slice(0, 5);

  return (
    <>
      <Card className="p-6">
        <h2 className="text-xl font-serif mb-4">Yaklaşan Randevular</h2>
        <div className="space-y-4">
          {upcomingAppointments.map((appointment) => (
            <div key={appointment.id} className="flex items-center justify-between p-3 bg-accent rounded-lg">
              <div>
                <div className="font-medium">{appointment.customerName}</div>
                <div className="text-sm text-gray-500">
                  {appointment.date} - {appointment.time || appointment.startTime}
                </div>
                <div className="text-sm text-primary">{appointment.serviceName || appointment.service}</div>
                {appointment.cancellationNote && (
                  <div className="text-sm text-red-500">
                    İptal Nedeni: {appointment.cancellationNote}
                  </div>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant={
                  appointment.status === 'confirmed' ? 'secondary' :
                  appointment.status === 'cancelled' ? 'destructive' :
                  'default'
                }>
                  {appointment.status === 'confirmed' ? 'Onaylandı' :
                   appointment.status === 'cancelled' ? 'İptal Edildi' :
                   'Beklemede'}
                </Badge>
                <div className="flex space-x-2">
                  {appointment.status !== 'cancelled' && (
                    <>
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
                    </>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-green-600"
                    onClick={() => handleWhatsAppShare(appointment)}
                  >
                    <MessageSquare className="h-4 w-4" />
                  </Button>
                </div>
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
            <Button 
              variant="outline" 
              onClick={() => {
                setShowCancelDialog(false);
                setCancellationNote('');
                setSelectedAppointment(null);
              }}
            >
              Vazgeç
            </Button>
            <Button variant="destructive" onClick={handleConfirmCancellation}>
              İptal Et
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default UpcomingAppointments;
