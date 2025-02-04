import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AppointmentList from '@/components/appointments/AppointmentList';
import AppointmentForm from '@/components/appointments/AppointmentForm';
import WeeklyCalendar from '@/components/appointments/WeeklyCalendar';
import SearchInput from '@/components/common/SearchInput';
import DateSelectionDialog from '@/components/common/DateSelectionDialog';

const Appointments = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const handleSuccess = () => {
    console.log('Appointment created successfully');
  };

  const handleCancel = () => {
    console.log('Appointment creation cancelled');
  };

  return (
    <div className="p-8 pl-72 animate-fadeIn">
      <div className="mb-8">
        <h1 className="text-4xl font-serif">Randevu Yönetimi</h1>
      </div>

      <Tabs defaultValue="daily" className="w-full">
        <TabsList>
          <TabsTrigger value="daily">Günlük Görünüm</TabsTrigger>
          <TabsTrigger value="weekly">Haftalık Plan</TabsTrigger>
        </TabsList>
        
        <TabsContent value="daily">
          <div className="space-y-4">
            <SearchInput
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Randevu ara..."
            />
            
            <DateSelectionDialog
              selectedDate={selectedDate}
              onDateSelect={setSelectedDate}
            />

            <AppointmentForm 
              selectedDate={selectedDate}
              onSuccess={handleSuccess}
              onCancel={handleCancel}
            />
            <AppointmentList searchTerm={searchTerm} />
          </div>
        </TabsContent>

        <TabsContent value="weekly">
          <WeeklyCalendar appointments={[]} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Appointments;