import { getCustomers } from '@/utils/storage/customers';
import { getGroupSchedules, deleteGroupSchedule } from '@/utils/storage/groupSchedules';
import { getAppointments, setAppointments } from '@/utils/storage/appointments';

// Remove orphans where a referenced customer no longer exists
export const reconcileCustomerReferences = async (): Promise<{ removedSchedules: number; removedAppointments: number }> => {
  const customers = await getCustomers();
  const customerIds = new Set(customers.map(c => String(c.id)));

  // Group schedules (server-side) - delete if customer missing
  let removedSchedules = 0;
  try {
    const schedules = await getGroupSchedules();
    for (const s of schedules) {
      if (!customerIds.has(String(s.customerId))) {
        const deleted = await deleteGroupSchedule(s.id);
        if (deleted) removedSchedules++;
      }
    }
  } catch (err) {
    console.warn('Error reconciling group schedules:', err);
  }

  // Local appointments (client-side) - remove orphans
  let removedAppointments = 0;
  try {
    const appointments = await getAppointments();
    const filtered = appointments.filter(a => {
      const keep = a.customerId == null || customerIds.has(String(a.customerId));
      if (!keep) removedAppointments++;
      return keep;
    });
    if (filtered.length !== appointments.length) {
      await setAppointments(filtered as any);
    }
  } catch (err) {
    console.warn('Error reconciling appointments:', err);
  }

  return { removedSchedules, removedAppointments };
};

export default { reconcileCustomerReferences };
