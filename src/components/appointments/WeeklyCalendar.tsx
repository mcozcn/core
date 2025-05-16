
import { Card } from "@/components/ui/card";
import CalendarHeader from './calendar/CalendarHeader';
import CalendarGrid from './calendar/CalendarGrid';
import { useWeeklyCalendar } from './calendar/useWeeklyCalendar';
import type { Appointment } from '../../utils/storage/types';

interface WeeklyCalendarProps {
  appointments: Appointment[];
}

const WeeklyCalendar = ({ appointments }: WeeklyCalendarProps) => {
  const {
    dateRange,
    goToNextWeek,
    goToPreviousWeek,
    goToCurrentWeek,
    handlePrint,
    workingHours,
    weekDays,
  } = useWeeklyCalendar(appointments);

  return (
    <Card className="p-4 overflow-auto">
      <CalendarHeader 
        dateRange={dateRange}
        onPreviousWeek={goToPreviousWeek}
        onNextWeek={goToNextWeek}
        onCurrentWeek={goToCurrentWeek}
        onPrint={handlePrint}
      />
      
      <CalendarGrid 
        weekDays={weekDays}
        workingHours={workingHours}
        appointments={appointments}
      />
    </Card>
  );
};

export default WeeklyCalendar;
