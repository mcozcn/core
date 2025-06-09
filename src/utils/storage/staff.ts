
import { getFromStorage, setToStorage } from './core';
import { STORAGE_KEYS } from './storageKeys';
import type { StaffPerformance } from './types';
import { getAllUsers } from './userManager';
import { getAppointments } from './appointments';
import { getServiceSales } from './services';
import { getSales } from './stock';

export const getStaffPerformance = async (
  startDate?: Date, 
  endDate?: Date
): Promise<StaffPerformance[]> => {
  // Get all users who are staff
  const users = await getAllUsers();
  const staffUsers = users.filter(user => user.role === 'staff' || user.role === 'user');
  
  // Get real data
  const appointments = await getAppointments();
  const serviceSales = await getServiceSales();
  const productSales = await getSales();
  
  const staffPerformance = await Promise.all(staffUsers.map(async (user) => {
    // Filter appointments for this user
    const userAppointments = appointments.filter(apt => apt.staffId === user.id);
    
    // Calculate appointment metrics
    const totalAppointments = userAppointments.length;
    const confirmedAppointments = userAppointments.filter(apt => apt.status === 'confirmed').length;
    const cancelledAppointments = userAppointments.filter(apt => apt.status === 'cancelled').length;
    const pendingAppointments = userAppointments.filter(apt => apt.status === 'pending').length;
    
    // Filter sales for this user
    const userServiceSales = serviceSales.filter(sale => sale.staffId === user.id);
    const userProductSales = productSales.filter(sale => sale.staffId === user.id);
    
    // Calculate revenue
    const serviceRevenue = userServiceSales.reduce((sum, sale) => sum + (sale.totalPrice || sale.price || 0), 0);
    const productRevenue = userProductSales.reduce((sum, sale) => sum + (sale.totalPrice || 0), 0);
    const totalRevenue = serviceRevenue + productRevenue;
    
    // Calculate commission
    const totalCommission = userServiceSales.reduce((sum, sale) => sum + (sale.commissionAmount || 0), 0) +
                           userProductSales.reduce((sum, sale) => sum + (sale.commissionAmount || 0), 0);
    
    return {
      id: user.id,
      name: user.displayName || user.username,
      role: user.title || 'Personel',
      servicesProvided: userServiceSales.length,
      totalRevenue,
      appointmentsCount: totalAppointments,
      confirmedAppointments,
      cancelledAppointments,
      pendingAppointments,
      productSales: userProductSales.length,
      totalCommission,
      avgRating: 0 // Removed rating system
    };
  }));
  
  return staffPerformance;
};

export const setStaffPerformance = async (staff: StaffPerformance[]): Promise<void> => {
  await setToStorage(STORAGE_KEYS.STAFF, staff);
};

export const updateStaffServiceCount = async (
  staffId: number, 
  serviceCount: number = 1, 
  revenue: number = 0
): Promise<void> => {
  const staffList = await getStaffPerformance();
  
  const updatedStaffList = staffList.map(staff => {
    if (staff.id === staffId) {
      return {
        ...staff,
        servicesProvided: staff.servicesProvided + serviceCount,
        totalRevenue: staff.totalRevenue + revenue
      };
    }
    return staff;
  });
  
  await setStaffPerformance(updatedStaffList);
};

export const updateStaffAppointmentCount = async (
  staffId: number, 
  appointmentCount: number = 1
): Promise<void> => {
  const staffList = await getStaffPerformance();
  
  const updatedStaffList = staffList.map(staff => {
    if (staff.id === staffId) {
      return {
        ...staff,
        appointmentsCount: staff.appointmentsCount + appointmentCount
      };
    }
    return staff;
  });
  
  await setStaffPerformance(updatedStaffList);
};
