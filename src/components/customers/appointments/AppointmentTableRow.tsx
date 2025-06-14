
import { useState } from "react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { MessageSquare } from "lucide-react";
import { createAppointmentWhatsAppLink } from "@/utils/whatsapp";
import { Appointment } from "@/utils/localStorage";
import StatusBadge from "./StatusBadge";
import CancelAppointmentDialog from "./CancelAppointmentDialog";

interface AppointmentTableRowProps {
  appointment: Appointment;
  customerPhone: string;
}

const AppointmentTableRow = ({ appointment, customerPhone }: AppointmentTableRowProps) => {
  const [showCancellationDialog, setShowCancellationDialog] = useState(false);
  const { toast } = useToast();

  const handleWhatsAppShare = () => {
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
        service: appointment.serviceName || appointment.service,
        date: appointment.date,
        time: appointment.time || appointment.startTime,
        staffName: appointment.staffName,
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

  return (
    <>
      <TableRow>
        <TableCell>
          {format(new Date(appointment.date), 'PPP', { locale: tr })}
        </TableCell>
        <TableCell>{appointment.time || appointment.startTime}</TableCell>
        <TableCell>{appointment.serviceName || appointment.service}</TableCell>
        <TableCell><StatusBadge status={appointment.status || 'pending'} /></TableCell>
        <TableCell>
          {appointment.status === 'cancelled' 
            ? `İptal Nedeni: ${appointment.cancellationNote || 'Belirtilmedi'}`
            : appointment.notes || '-'}
        </TableCell>
        <TableCell>
          <div className="flex space-x-2">
            {appointment.status !== 'cancelled' && (
              <Button 
                variant="destructive" 
                size="sm"
                onClick={() => setShowCancellationDialog(true)}
              >
                İptal Et
              </Button>
            )}
            <Button 
              variant="outline" 
              size="sm"
              className="text-green-600 border-green-600 hover:bg-green-50"
              onClick={handleWhatsAppShare}
            >
              <MessageSquare className="h-4 w-4 mr-1" />
              WhatsApp
            </Button>
          </div>
        </TableCell>
      </TableRow>

      <CancelAppointmentDialog
        appointmentId={appointment.id}
        isOpen={showCancellationDialog}
        onOpenChange={setShowCancellationDialog}
      />
    </>
  );
};

export default AppointmentTableRow;
