
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { getAppointments, setAppointments } from "@/utils/localStorage";

interface CancelAppointmentDialogProps {
  appointmentId: number;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const CancelAppointmentDialog = ({ appointmentId, isOpen, onOpenChange }: CancelAppointmentDialogProps) => {
  const [cancellationNote, setCancellationNote] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleCancelAppointment = () => {
    const allAppointments = getAppointments();
    const updatedAppointments = allAppointments.map(apt => 
      apt.id === appointmentId 
        ? { ...apt, status: 'cancelled' as const, cancellationNote } 
        : apt
    );

    setAppointments(updatedAppointments);
    queryClient.setQueryData(['appointments'], updatedAppointments);

    toast({
      title: "Randevu iptal edildi",
      description: "Randevu başarıyla iptal edildi.",
    });

    onOpenChange(false);
    setCancellationNote("");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
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
  );
};

export default CancelAppointmentDialog;
