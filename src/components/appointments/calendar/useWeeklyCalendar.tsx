
import { useState, useEffect } from 'react';
import { 
  addDays, 
  format,
  startOfWeek, 
  endOfWeek,
  eachHourOfInterval, 
  setHours, 
  setMinutes,
  addWeeks,
  subWeeks
} from "date-fns";
import { tr } from 'date-fns/locale';
import { DateRange } from "react-day-picker";
import { Appointment } from '../../../utils/storage/types';

export const useWeeklyCalendar = (appointments: Appointment[]) => {
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(() => {
    const today = new Date();
    return startOfWeek(today, { locale: tr });
  });
  
  const [dateRange, setDateRange] = useState<DateRange>(() => {
    const start = startOfWeek(new Date(), { locale: tr });
    return {
      from: start,
      to: endOfWeek(start, { locale: tr })
    };
  });

  // Update the date range when the week changes
  useEffect(() => {
    setDateRange({
      from: currentWeekStart,
      to: endOfWeek(currentWeekStart, { locale: tr })
    });
  }, [currentWeekStart]);

  const goToNextWeek = () => {
    const nextWeek = addWeeks(currentWeekStart, 1);
    setCurrentWeekStart(nextWeek);
  };

  const goToPreviousWeek = () => {
    const prevWeek = subWeeks(currentWeekStart, 1);
    setCurrentWeekStart(prevWeek);
  };

  const goToCurrentWeek = () => {
    const today = new Date();
    setCurrentWeekStart(startOfWeek(today, { locale: tr }));
  };

  // Handle custom week selection from calendar
  const handleWeekSelect = (range: DateRange | undefined) => {
    if (range?.from) {
      const weekStart = startOfWeek(range.from, { locale: tr });
      setCurrentWeekStart(weekStart);
    }
  };

  const handlePrint = () => {
    const printContent = document.getElementById('calendar-content');
    const printWindow = window.open('', '', 'width=800,height=600');
    
    if (printWindow && printContent) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Haftalık Plan</title>
            <style>
              @page {
                size: landscape;
                margin: 10mm;
              }
              body {
                margin: 0;
                padding: 10mm;
                font-family: system-ui, -apple-system, sans-serif;
              }
              .grid {
                display: grid;
                grid-template-columns: repeat(7, 1fr);
              }
              .text-center { text-align: center; }
              .border { border: 1px solid #e2e8f0; }
              .rounded { border-radius: 4px; }
              .p-1 { padding: 4px; }
              .mb-1 { margin-bottom: 4px; }
              .mb-4 { margin-bottom: 16px; }
              .text-xs { font-size: 10px; }
              .font-semibold { font-weight: 600; }
              .min-h-cell { min-height: 40px; }
            </style>
          </head>
          <body>
            ${printContent.innerHTML}
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    }
  };

  const workingHours = eachHourOfInterval({
    start: setHours(setMinutes(new Date(), 0), 9),
    end: setHours(setMinutes(new Date(), 0), 19),
  });

  // Create week days - Monday to Saturday (exclude Sunday)
  const weekDays = Array.from({ length: 6 }, (_, i) => {
    // Start with Monday (index 1) and go through Saturday (index 6)
    const dayIndex = i + 1;
    return addDays(currentWeekStart, dayIndex);
  });

  return {
    dateRange,
    goToNextWeek,
    goToPreviousWeek,
    goToCurrentWeek,
    handleWeekSelect,
    handlePrint,
    workingHours,
    weekDays,
  };
};
