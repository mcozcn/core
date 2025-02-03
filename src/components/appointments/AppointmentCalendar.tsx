import React from 'react';
import { Calendar } from "@/components/ui/calendar";
import { Card } from "@/components/ui/card";
import { addDays, startOfDay } from "date-fns";
import { tr } from 'date-fns/locale';

interface AppointmentCalendarProps {
  selectedDate: Date;
  onSelect: (date: Date | undefined) => void;
}

const AppointmentCalendar = ({ selectedDate, onSelect }: AppointmentCalendarProps) => {
  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      // Seçilen tarihi başlangıç saatine ayarla (00:00:00)
      const normalizedDate = startOfDay(date);
      onSelect(normalizedDate);
    } else {
      onSelect(undefined);
    }
  };

  return (
    <Card className="p-4 bg-accent/50 dark:bg-accent/10 w-full h-full flex flex-col">
      <Calendar
        mode="single"
        selected={selectedDate}
        onSelect={handleDateSelect}
        disabled={(date) => date < addDays(new Date(), -1)}
        className="rounded-md border dark:border-accent w-full h-full"
        locale={tr}
        styles={{
          head_cell: {
            width: '100%',
            textAlign: 'center',
          },
          cell: {
            width: '100%',
            height: '100%',
          },
          table: {
            width: '100%',
            height: '100%',
          },
        }}
      />
    </Card>
  );
};

export default AppointmentCalendar;