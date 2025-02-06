import { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import { addDays, format, startOfWeek, eachHourOfInterval, setHours, setMinutes, parseISO } from "date-fns";
import { tr } from 'date-fns/locale';

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
  const [selectedDate, setSelectedDate] = useState(new Date());

  const handlePrint = () => {
    window.print();
  };

  const workingHours = eachHourOfInterval({
    start: setHours(setMinutes(new Date(), 0), 9),
    end: setHours(setMinutes(new Date(), 0), 19),
  });

  const weekDays = Array.from({ length: 7 }, (_, i) => 
    addDays(startOfWeek(selectedDate, { locale: tr }), i)
  );

  console.log('Weekly Calendar Appointments:', appointments);

  return (
    <Card className="p-4 overflow-auto">
      <div className="flex justify-between items-center mb-4 print:hidden">
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
      
      <div className="min-w-[800px] print:m-0 print:w-full print:min-w-full">
        <div className="grid grid-cols-8 gap-2 mb-4">
          <div className="font-semibold text-center text-sm print:text-xs">Saat</div>
          {weekDays.map((day) => (
            <div key={day.toString()} className="font-semibold text-center text-sm print:text-xs">
              {format(day, 'EEEE', { locale: tr })}
              <br />
              {format(day, 'd MMMM', { locale: tr })}
            </div>
          ))}
        </div>

        {workingHours.map((hour) => (
          <div key={hour.toString()} className="grid grid-cols-8 gap-2 mb-2">
            <div className="text-center py-2 text-sm print:text-xs print:py-1">
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
                  className="min-h-[60px] print:min-h-[40px] border rounded-md p-1"
                >
                  {dayAppointments.map((apt) => (
                    <div
                      key={apt.id}
                      className={`text-xs print:text-[8px] p-1 mb-1 rounded ${apt.status === 'cancelled' ? 'opacity-50' : ''}`}
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

      <style>
        {`
          @media print {
            @page {
              size: landscape;
              margin: 10mm;
            }
            body {
              width: 100%;
              height: 100%;
              margin: 0;
              padding: 0;
            }
            .card {
              box-shadow: none !important;
              border: none !important;
            }
          }
        `}
      </style>
    </Card>
  );
};

export default WeeklyCalendar;