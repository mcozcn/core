import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Calendar, UserPlus, Clock } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Appointment {
  id: number;
  customerName: string;
  date: string;
  time: string;
  service: string;
  createdAt: Date;
}

const Appointments = () => {
  const [customerName, setCustomerName] = useState('');
  const [appointmentDate, setAppointmentDate] = useState('');
  const [appointmentTime, setAppointmentTime] = useState('');
  const [service, setService] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [showForm, setShowForm] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const newAppointment: Appointment = {
        id: appointments.length + 1,
        customerName,
        date: appointmentDate,
        time: appointmentTime,
        service,
        createdAt: new Date(),
      };
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      setAppointments(prev => [...prev, newAppointment]);
      
      console.log('Appointment submitted:', newAppointment);
      
      toast({
        title: "Randevu başarıyla kaydedildi",
        description: `${customerName} için randevu oluşturuldu.`,
      });

      setCustomerName('');
      setAppointmentDate('');
      setAppointmentTime('');
      setService('');
      setShowForm(false);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Hata!",
        description: "Randevu kaydedilirken bir hata oluştu. Lütfen tekrar deneyin.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-8 pl-72 animate-fadeIn">
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Calendar className="text-primary" size={32} />
          <h1 className="text-4xl font-serif">Randevu Yönetimi</h1>
        </div>
        <Button onClick={() => setShowForm(true)} className="flex items-center gap-2">
          <UserPlus size={20} />
          Yeni Randevu Ekle
        </Button>
      </div>

      {showForm && (
        <Card className="p-6 mb-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Müşteri Adı</Label>
              <Input 
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Müşteri adını girin"
                required
              />
            </div>

            <div>
              <Label>Randevu Tarihi</Label>
              <Input 
                type="date"
                value={appointmentDate}
                onChange={(e) => setAppointmentDate(e.target.value)}
                required
              />
            </div>

            <div>
              <Label>Randevu Saati</Label>
              <Input 
                type="time"
                value={appointmentTime}
                onChange={(e) => setAppointmentTime(e.target.value)}
                required
              />
            </div>

            <div>
              <Label>Hizmet</Label>
              <Input 
                value={service}
                onChange={(e) => setService(e.target.value)}
                placeholder="Alınacak hizmeti girin"
                required
              />
            </div>

            <div className="flex gap-2">
              <Button 
                type="submit" 
                className="flex-1"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Kaydediliyor..." : "Randevuyu Kaydet"}
              </Button>
              <Button 
                type="button" 
                variant="outline"
                onClick={() => setShowForm(false)}
              >
                İptal
              </Button>
            </div>
          </form>
        </Card>
      )}

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Müşteri Adı</TableHead>
              <TableHead>Tarih</TableHead>
              <TableHead>Saat</TableHead>
              <TableHead>Hizmet</TableHead>
              <TableHead>Kayıt Tarihi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {appointments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  Henüz randevu kaydı bulunmamaktadır.
                </TableCell>
              </TableRow>
            ) : (
              appointments.map((appointment) => (
                <TableRow key={appointment.id}>
                  <TableCell>{appointment.customerName}</TableCell>
                  <TableCell>{appointment.date}</TableCell>
                  <TableCell>{appointment.time}</TableCell>
                  <TableCell>{appointment.service}</TableCell>
                  <TableCell>
                    {new Date(appointment.createdAt).toLocaleDateString('tr-TR')}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};

export default Appointments;