import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, UserPlus } from 'lucide-react';
import { useQuery } from "@tanstack/react-query";
import { getAppointments } from "@/utils/localStorage";
import AppointmentCalendar from '@/components/appointments/AppointmentCalendar';
import AppointmentForm from '@/components/appointments/AppointmentForm';
import AppointmentList from '@/components/appointments/AppointmentList';

const Appointments = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showForm, setShowForm] = useState(false);

  const { data: appointments = [] } = useQuery({
    queryKey: ['appointments'],
    queryFn: () => {
      console.log('Fetching appointments from local storage');
      return getAppointments();
    },
  });

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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <AppointmentCalendar
            selectedDate={selectedDate}
            onSelect={(date) => date && setSelectedDate(date)}
          />
        </div>

        <div className="md:col-span-2">
          {showForm ? (
            <AppointmentForm
              selectedDate={selectedDate}
              onSuccess={() => setShowForm(false)}
              onCancel={() => setShowForm(false)}
            />
          ) : (
            <Card>
              <AppointmentList
                appointments={appointments}
                selectedDate={selectedDate}
              />
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Appointments;