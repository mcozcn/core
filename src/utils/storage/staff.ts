
import { getFromStorage, setToStorage } from './core';
import { STORAGE_KEYS } from './storageKeys';
import { getAppointments } from './appointments';
import { getServiceSales } from './services';
import { getAllUsers } from '@/utils/auth';
import type { StaffPerformance } from './types';

// Get real staff members from the personnel management
export const getStaff = async () => {
  const allUsers = getAllUsers();
  return allUsers.filter(user => user.role === 'staff').map(user => ({
    id: user.id,
    name: user.displayName || user.username,
    role: user.title || 'Personel'
  }));
};

// Staff service mappings - in a real app, this would come from a database
// For now, we'll keep using this mock mapping
const staffServiceMappings = [
  { staffId: 1, serviceIds: [1, 3, 5] },
  { staffId: 2, serviceIds: [1, 2, 4] },
  { staffId: 3, serviceIds: [6, 7] },
  { staffId: 4, serviceIds: [8, 9, 10] }
];

export const getStaffServices = () => {
  return staffServiceMappings;
};

export const getStaffPerformance = async (periodInDays: number = 30): Promise<StaffPerformance[]> => {
  const appointments = await getAppointments();
  const serviceSales = await getServiceSales();
  const staff = await getStaff();
  
  // Filter by period
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - periodInDays);
  
  const filteredSales = serviceSales.filter(sale => 
    new Date(sale.saleDate) >= cutoffDate
  );
  
  const filteredAppointments = appointments.filter(
    apt => new Date(`${apt.date}T${apt.time}`) >= cutoffDate
  );
  
  return staff.map(staffMember => {
    // Get services assigned to this staff member
    const staffServiceIds = staffServiceMappings
      .find(s => s.staffId === staffMember.id)?.serviceIds || [];
    
    // Filter sales by services this staff member provides
    const staffSales = filteredSales.filter(sale => 
      staffServiceIds.includes(sale.serviceId)
    );
    
    // Filter appointments handled by this staff
    const staffAppointments = filteredAppointments.filter(
      apt => apt.staffId === staffMember.id
    );
    
    const servicesProvided = staffSales.length;
    const totalRevenue = staffSales.reduce((sum, sale) => sum + sale.price, 0);
    const appointmentsCount = staffAppointments.length;
    
    // Calculate average rating based on appointments
    // Since we don't have real ratings, use a mock rating between 4-5
    const avgRating = (4 + Math.random()).toFixed(1);
    
    return {
      ...staffMember,
      servicesProvided,
      totalRevenue,
      appointmentsCount,
      avgRating: parseFloat(avgRating) > 5 ? '5.0' : avgRating
    };
  }).sort((a, b) => b.totalRevenue - a.totalRevenue);
};
