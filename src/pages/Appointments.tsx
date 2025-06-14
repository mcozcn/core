
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useQuery } from "@tanstack/react-query";
import { getAppointments } from "@/utils/localStorage";
import AppointmentList from "@/components/appointments/AppointmentList";
import WeeklyCalendar from "@/components/appointments/WeeklyCalendar";
import AppointmentCalendar from "@/components/appointments/AppointmentCalendar";
import AppointmentForm from "@/components/appointments/AppointmentForm";
import { format, addDays, startOfWeek, endOfWeek } from "date-fns";
import { tr } from "date-fns/locale";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Search, Calendar as CalendarIcon } from "lucide-react";
import DateSelectionDialog from '@/components/common/DateSelectionDialog';

const Appointments = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [searchTerm, setSearchTerm] = useState('');
  const [showAppointmentForm, setShowAppointmentForm] = useState(false);
  const [activeTab, setActiveTab] = useState("daily");

  const { data: appointments = [], refetch } = useQuery({
    queryKey: ['appointments'],
    queryFn: getAppointments,
  });

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
  };

  const handleAppointmentSuccess = () => {
    setShowAppointmentForm(false);
    refetch();
  };

  // Filtreleme fonksiyonu
  const filterAppointments = (appointments: any[]) => {
    return appointments.filter(appointment => {
      const matchesSearch = !searchTerm || 
        appointment.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        appointment.serviceName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        appointment.staffName?.toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchesSearch;
    });
  };

  const filteredAppointments = filterAppointments(appointments);

  // Günlük randevular (seçilen tarih)
  const dailyAppointments = filteredAppointments.filter(appointment => {
    const appointmentDate = new Date(appointment.date);
    return appointmentDate.toDateString() === selectedDate.toDateString();
  });

  // Haftalık randevular (seçilen tarihin haftası)
  const weekStart = startOfWeek(selectedDate, { locale: tr });
  const weekEnd = endOfWeek(selectedDate, { locale: tr });
  
  const weeklyAppointments = filteredAppointments.filter(appointment => {
    const appointmentDate = new Date(appointment.date);
    return appointmentDate >= weekStart && appointmentDate <= weekEnd;
  });

  return (
    <div className="p-6 pl-72 animate-fadeIn">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-serif">Randevu Yönetimi</h1>
          <p className="text-muted-foreground mt-1">Randevularınızı planlayın ve yönetin</p>
        </div>
        <Button onClick={() => setShowAppointmentForm(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Yeni Randevu
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="daily">Günlük Görünüm</TabsTrigger>
          <TabsTrigger value="weekly">Haftalık Görünüm</TabsTrigger>
          <TabsTrigger value="calendar">Takvim Görünümü</TabsTrigger>
        </TabsList>

        <TabsContent value="daily">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5" />
                {format(selectedDate, 'd MMMM yyyy, EEEE', { locale: tr })} - Günlük Randevular
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="flex-1 max-w-sm">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      placeholder="Müşteri, hizmet veya personel ara..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="w-full sm:w-auto min-w-[250px]">
                  <DateSelectionDialog
                    selectedDate={selectedDate}
                    onDateSelect={handleDateSelect}
                  />
                </div>
              </div>
              <AppointmentList searchTerm={searchTerm} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="weekly">
          <Card>
            <CardHeader>
              <CardTitle>Haftalık Görünüm</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="flex-1 max-w-sm">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      placeholder="Müşteri, hizmet veya personel ara..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="w-full sm:w-auto min-w-[250px]">
                  <DateSelectionDialog
                    selectedDate={selectedDate}
                    onDateSelect={handleDateSelect}
                  />
                </div>
              </div>
              <WeeklyCalendar appointments={weeklyAppointments} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="calendar">
          <Card>
            <CardHeader>
              <CardTitle>Takvim Görünümü</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="flex-1 max-w-sm">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      placeholder="Müşteri, hizmet veya personel ara..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>
              <AppointmentCalendar 
                selectedDate={selectedDate}
                onSelect={handleDateSelect}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={showAppointmentForm} onOpenChange={setShowAppointmentForm}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Yeni Randevu</DialogTitle>
          </DialogHeader>
          <AppointmentForm
            selectedDate={selectedDate}
            onSuccess={handleAppointmentSuccess}
            onCancel={() => setShowAppointmentForm(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Appointments;
