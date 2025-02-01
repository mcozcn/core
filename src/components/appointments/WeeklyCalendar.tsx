import { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { addDays, format, startOfWeek, eachHourOfInterval, setHours, setMinutes, getHours } from "date-fns";
import { tr } from 'date-fns/locale';
import { getCurrentUser, getAuthState } from "@/utils/auth";

interface Appointment {
  id: number;
  customerId: number;
  customerName: string;
  date: Date;
  services: string[];
  notes?: string;
  userId: number;
  status: 'active' | 'cancelled';
  cancellationReason?: string;
}

interface WeeklyCalendarProps {
  appointments: Appointment[];
}

const WeeklyCalendar = ({ appointments }: WeeklyCalendarProps) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const users = getAuthState().users;

  // İş saatleri aralığını oluştur (09:00-19:00)
  const workingHours = eachHourOfInterval({
    start: setHours(setMinutes(new Date(), 0), 9),
    end: setHours(setMinutes(new Date(), 0), 19),
  });

  // Haftanın günlerini oluştur
  const weekDays = Array.from({ length: 7 }, (_, i) => 
    addDays(startOfWeek(selectedDate, { locale: tr }), i)
  );

  return (
    <Card className="p-4 overflow-auto">
      <div className="min-w-[800px]">
        {/* Başlık satırı - Günler */}
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

        {/* Saat satırları */}
        {workingHours.map((hour) => (
          <div key={hour.toString()} className="grid grid-cols-8 gap-2 mb-2">
            <div className="text-center py-2 text-sm">
              {format(hour, 'HH:mm')}
            </div>
            {weekDays.map((day) => {
              const dayAppointments = appointments.filter(apt => {
                const aptDate = new Date(apt.date);
                return format(aptDate, 'yyyy-MM-dd HH') === format(setHours(day, getHours(hour)), 'yyyy-MM-dd HH');
              });

              return (
                <div
                  key={day.toString()}
                  className="min-h-[60px] border rounded-md p-1"
                >
                  {dayAppointments.map((apt) => {
                    const user = users.find(u => u.id === apt.userId);
                    return (
                      <div
                        key={apt.id}
                        className="text-xs p-1 mb-1 rounded"
                        style={{
                          backgroundColor: user?.color || '#gray',
                          color: 'white'
                        }}
                      >
                        {apt.customerName}
                        {apt.status === 'cancelled' && ' (İptal)'}
                      </div>
                    );
                  })}
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