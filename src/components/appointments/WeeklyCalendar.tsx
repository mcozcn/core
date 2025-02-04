import { useState } from 'react';
import { Card } from "@/components/ui/card";
import { addDays, format, startOfWeek, eachHourOfInterval, setHours, setMinutes } from "date-fns";
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

  const workingHours = eachHourOfInterval({
    start: setHours(setMinutes(new Date(), 0), 9),
    end: setHours(setMinutes(new Date(), 0), 19),
  });

  const weekDays = Array.from({ length: 7 }, (_, i) => 
    addDays(startOfWeek(selectedDate, { locale: tr }), i)
  );

  return (
    <Card className="p-4 overflow-auto">
      <div className="min-w-[800px]">
        <div className="grid grid-cols-8 gap-2 mb-4">
          <div className="font-semibold text-center">Saat</div>
          {weekDays.map((day) => (
            <div key={day.toString()} className="font-semibold text-center">
              {format(day, 'EEEE', { locale: tr })}
              <br />
              {format(day, 'd MMMM', { locale: tr })}
            </div>
          ))}
        </div>

        {workingHours.map((hour) => (
          <div key={hour.toString()} className="grid grid-cols-8 gap-2 mb-2">
            <div className="text-center py-2 text-sm">
              {format(hour, 'HH:mm')}
            </div>
            {weekDays.map((day) => {
              const dayAppointments = appointments.filter(apt => {
                const aptHour = apt.time.split(':')[0];
                const currentHour = format(hour, 'HH');
                return format(new Date(apt.date), 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd') &&
                       aptHour === currentHour;
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
                      title={apt.status === 'cancelled' ? `İptal Nedeni: ${apt.cancellationNote || 'Belirtilmedi'}` : undefined}
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