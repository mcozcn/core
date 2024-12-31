import React from 'react';
import { Calendar } from "@/components/ui/calendar";
import { Card } from "@/components/ui/card";
import { addDays } from "date-fns";

interface AppointmentCalendarProps {
  selectedDate: Date;
  onSelect: (date: Date | undefined) => void;
}

const AppointmentCalendar = ({ selectedDate, onSelect }: AppointmentCalendarProps) => {
  return (
    <Card className="p-4">
      <Calendar
        mode="single"
        selected={selectedDate}
        onSelect={onSelect}
        disabled={(date) => date < addDays(new Date(), -1)}
        className="rounded-md border"
      />
    </Card>
  );
};

export default AppointmentCalendar;