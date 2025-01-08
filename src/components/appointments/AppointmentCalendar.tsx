import React from 'react';
import { Calendar } from "@/components/ui/calendar";
import { Card } from "@/components/ui/card";
import { addDays } from "date-fns";
import { tr } from 'date-fns/locale';

interface AppointmentCalendarProps {
  selectedDate: Date;
  onSelect: (date: Date | undefined) => void;
}

const AppointmentCalendar = ({ selectedDate, onSelect }: AppointmentCalendarProps) => {
  return (
    <Card className="p-4 bg-accent/50 dark:bg-accent/10 w-full h-full flex items-center justify-center">
      <Calendar
        mode="single"
        selected={selectedDate}
        onSelect={onSelect}
        disabled={(date) => date < addDays(new Date(), -1)}
        className="rounded-md border dark:border-accent w-full max-w-[350px]"
        locale={tr}
      />
    </Card>
  );
};

export default AppointmentCalendar;