
import { Appointment } from '../../../utils/storage/types';

interface AppointmentCellProps {
  appointments: Appointment[];
}

const AppointmentCell = ({ appointments }: AppointmentCellProps) => {
  return (
    <div className="min-h-[60px] border rounded-md p-1">
      {appointments.map((apt) => (
        <div
          key={apt.id}
          className={`text-xs p-1 mb-1 rounded ${apt.status === 'cancelled' ? 'opacity-50' : ''}`}
          style={{
            backgroundColor: apt.staffColor || '#gray',
            color: 'white'
          }}
          title={`${apt.serviceName || apt.service} - ${apt.time || apt.startTime}${apt.status === 'cancelled' ? ` (İptal Nedeni: ${apt.cancellationNote || 'Belirtilmedi'})` : ''}`}
        >
          {apt.customerName} ({apt.staffName})
          {apt.status === 'cancelled' && ' (İptal)'}
        </div>
      ))}
    </div>
  );
};

export default AppointmentCell;
