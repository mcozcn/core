
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import AppointmentList from '@/components/appointments/AppointmentList';
import AppointmentForm from '@/components/appointments/AppointmentForm';
import WeeklyCalendar from '@/components/appointments/WeeklyCalendar';
import SearchInput from '@/components/common/SearchInput';
import DateSelectionDialog from '@/components/common/DateSelectionDialog';
import { useQuery } from '@tanstack/react-query';
import { getAppointments } from '@/utils/storage/appointments';
import { Calendar, Plus, Clock, Users, CheckCircle, AlertCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const Appointments = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showAddDialog, setShowAddDialog] = useState(false);

  const { data: appointments = [] } = useQuery({
    queryKey: ['appointments'],
    queryFn: getAppointments,
  });

  const handleSuccess = () => {
    console.log('Appointment created successfully');
    setShowAddDialog(false);
  };

  const handleCancel = () => {
    console.log('Appointment creation cancelled');
    setShowAddDialog(false);
  };

  // Calculate stats
  const today = new Date();
  const todayAppointments = appointments.filter(apt => 
    new Date(apt.date).toDateString() === today.toDateString()
  );
  const pendingAppointments = appointments.filter(apt => apt.status === 'pending');
  const confirmedAppointments = appointments.filter(apt => apt.status === 'confirmed');
  const totalAppointments = appointments.length;

  return (
    <div className="p-6 pl-72 animate-fadeIn space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif">Randevu Yönetimi</h1>
          <p className="text-muted-foreground mt-1">Randevularınızı kolayca yönetin ve takip edin</p>
        </div>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90 gap-2">
              <Plus className="h-4 w-4" />
              Yeni Randevu
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Yeni Randevu Oluştur</DialogTitle>
            </DialogHeader>
            <AppointmentForm 
              selectedDate={selectedDate}
              onSuccess={handleSuccess}
              onCancel={handleCancel}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500 rounded-lg">
                <Calendar className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Bugün</p>
                <p className="text-2xl font-bold text-blue-600">{todayAppointments.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border-orange-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-500 rounded-lg">
                <Clock className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Bekleyen</p>
                <p className="text-2xl font-bold text-orange-600">{pendingAppointments.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500 rounded-lg">
                <CheckCircle className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Onaylı</p>
                <p className="text-2xl font-bold text-green-600">{confirmedAppointments.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500 rounded-lg">
                <Users className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Toplam</p>
                <p className="text-2xl font-bold text-purple-600">{totalAppointments}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Randevu Görünümü
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="daily" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="daily" className="gap-2">
                <Calendar className="h-4 w-4" />
                Günlük Görünüm
              </TabsTrigger>
              <TabsTrigger value="weekly" className="gap-2">
                <Clock className="h-4 w-4" />
                Haftalık Plan
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="daily" className="space-y-6">
              {/* Search and Filter Section */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 sm:flex-[3]">
                  <SearchInput
                    value={searchTerm}
                    onChange={setSearchTerm}
                    placeholder="Randevu veya müşteri ara..."
                  />
                </div>
                <div className="flex-none sm:flex-[1]">
                  <DateSelectionDialog
                    selectedDate={selectedDate}
                    onDateSelect={setSelectedDate}
                  />
                </div>
              </div>

              {/* Quick Filters */}
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="cursor-pointer hover:bg-accent">
                  Tümü ({totalAppointments})
                </Badge>
                <Badge variant="outline" className="cursor-pointer hover:bg-accent text-orange-600">
                  Bekleyen ({pendingAppointments.length})
                </Badge>
                <Badge variant="outline" className="cursor-pointer hover:bg-accent text-green-600">
                  Onaylı ({confirmedAppointments.length})
                </Badge>
                <Badge variant="outline" className="cursor-pointer hover:bg-accent text-blue-600">
                  Bugün ({todayAppointments.length})
                </Badge>
              </div>

              <AppointmentList searchTerm={searchTerm} />
            </TabsContent>

            <TabsContent value="weekly">
              <WeeklyCalendar appointments={appointments} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Appointments;
