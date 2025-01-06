import React, { useState } from 'react';
import AppointmentCalendar from '@/components/appointments/AppointmentCalendar';
import AppointmentList from '@/components/appointments/AppointmentList';
import AppointmentForm from '@/components/appointments/AppointmentForm';
import SearchInput from '@/components/common/SearchInput';
import { Button } from '@/components/ui/button';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from 'next-themes';

const Appointments = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const { theme, setTheme } = useTheme();

  const handleSuccess = () => {
    console.log('Appointment created successfully');
  };

  const handleCancel = () => {
    console.log('Appointment creation cancelled');
  };

  return (
    <div className="p-8 pl-72 animate-fadeIn">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-4xl font-serif">Randevu Yönetimi</h1>
        <Button
          variant="outline"
          size="icon"
          className="w-10 h-10"
          onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
        >
          {theme === 'light' ? (
            <Moon className="h-5 w-5" />
          ) : (
            <Sun className="h-5 w-5" />
          )}
          <span className="sr-only">Tema değiştir</span>
        </Button>
      </div>

      <div className="mb-6">
        <SearchInput
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Randevu ara..."
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <AppointmentForm 
            selectedDate={selectedDate}
            onSuccess={handleSuccess}
            onCancel={handleCancel}
          />
          <AppointmentList searchTerm={searchTerm} />
        </div>
        <AppointmentCalendar 
          selectedDate={selectedDate}
          onSelect={setSelectedDate}
        />
      </div>
    </div>
  );
};

export default Appointments;