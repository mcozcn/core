
import { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Printer, Calendar } from "lucide-react";
import { 
  addDays, 
  format, 
  startOfWeek, 
  endOfWeek,
  eachHourOfInterval, 
  setHours, 
  setMinutes,
  addWeeks,
  subWeeks,
  getDay
} from "date-fns";
import { tr } from 'date-fns/locale';
import { DateRange } from "react-day-picker";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface Appointment {
  id: number;
  customerId: number;
  customerName: string;
  staffId: number;
  staffName: string;
  staffColor: string;
  date: string;
  time: string;
  service: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  cancellationNote?: string;
  createdAt: Date;
}

interface WeeklyCalendarProps {
  appointments: Appointment[];
}

const WeeklyCalendar = ({ appointments }: WeeklyCalendarProps) => {
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

  return (
    <Card className="p-4 overflow-auto">
      <div className="flex flex-wrap justify-between items-center gap-3 mb-4">
        <div className="flex items-center gap-2">
          <div className="flex items-center rounded-md border shadow-sm">
            <Button 
              variant="ghost" 
              size="sm"
              className="rounded-r-none border-r"
              onClick={goToPreviousWeek}
            >
              &#8592; Önceki Hafta
            </Button>
            
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="sm" className="flex gap-2">
                  <Calendar className="h-4 w-4" />
                  <span className="hidden sm:inline">
                    {format(dateRange.from!, 'd MMM', { locale: tr })} - {format(dateRange.to!, 'd MMM', { locale: tr })}
                  </span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <div className="p-3">
                  <div className="space-y-2">
                    <div className="grid gap-2">
                      <Button 
                        variant="outline" 
                        onClick={goToCurrentWeek}
                        size="sm"
                      >
                        Bu Haftaya Git
                      </Button>
                    </div>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
            
            <Button 
              variant="ghost" 
              size="sm"
              className="rounded-l-none border-l"
              onClick={goToNextWeek}
            >
              Sonraki Hafta &#8594;
            </Button>
          </div>
        </div>
        
        <Button 
          variant="outline" 
          size="sm"
          onClick={handlePrint}
          className="gap-2"
        >
          <Printer className="h-4 w-4" />
          Yazdır
        </Button>
      </div>
      
      <div id="calendar-content" className="min-w-[800px]">
        <div className="grid grid-cols-7 gap-2 mb-4">
          <div className="font-semibold text-center text-sm">Saat</div>
          {weekDays.map((day) => (
            <div key={day.toString()} className="font-semibold text-center text-sm">
              {format(day, 'EEEE', { locale: tr })}
              <br />
              {format(day, 'd MMMM', { locale: tr })}
            </div>
          ))}
        </div>

        {workingHours.map((hour) => (
          <div key={hour.toString()} className="grid grid-cols-7 gap-2 mb-2">
            <div className="text-center py-2 text-sm">
              {format(hour, 'HH:mm')}
            </div>
            {weekDays.map((day) => {
              const formattedDay = format(day, 'yyyy-MM-dd');
              
              const dayAppointments = appointments.filter(apt => {
                const aptHour = apt.time.split(':')[0];
                const currentHour = format(hour, 'HH');
                return apt.date === formattedDay && aptHour === currentHour;
              });

              return (
                <div
                  key={day.toString()}
                  className="min-h-[60px] border rounded-md p-1"
                >
                  {dayAppointments.map((apt) => (
                    <div
                      key={apt.id}
                      className={`text-xs p-1 mb-1 rounded ${apt.status === 'cancelled' ? 'opacity-50' : ''}`}
                      style={{
                        backgroundColor: apt.staffColor || '#gray',
                        color: 'white'
                      }}
                      title={`${apt.service} - ${apt.time}${apt.status === 'cancelled' ? ` (İptal Nedeni: ${apt.cancellationNote || 'Belirtilmedi'})` : ''}`}
                    >
                      {apt.customerName} ({apt.staffName})
                      {apt.status === 'cancelled' && ' (İptal)'}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </Card>
  );
};

export default WeeklyCalendar;
