
import { format, eachHourOfInterval, setHours, setMinutes } from "date-fns";
import { tr } from 'date-fns/locale';
import AppointmentCell from './AppointmentCell';
import { Appointment } from '../../../utils/storage/types';

interface CalendarGridProps {
  weekDays: Date[];
  workingHours: Date[];
  appointments: Appointment[];
}

const CalendarGrid = ({ weekDays, workingHours, appointments }: CalendarGridProps) => {
  return (
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
              <AppointmentCell 
                key={day.toString()}
                appointments={dayAppointments}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
};

export default CalendarGrid;
