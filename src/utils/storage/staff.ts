
import { getFromStorage, setToStorage } from './core';
import { STORAGE_KEYS } from './storageKeys';
import type { StaffPerformance } from './types';
import { getPersonnel } from './personnel';
import { getAppointments } from './appointments';
import { getServiceSales } from './services';
import { getSales } from './stock';

export const getStaffPerformance = async (
  startDate?: Date, 
  endDate?: Date
): Promise<StaffPerformance[]> => {
  // Get personnel from personnel section instead of users
  const personnel = await getPersonnel();
  
  // Get real data
  const appointments = await getAppointments();
  const serviceSales = await getServiceSales();
  const productSales = await getSales();
  
  const staffPerformance = await Promise.all(personnel.map(async (person) => {
    // Filter appointments for this person
    const userAppointments = appointments.filter(apt => apt.staffId === person.id);
    
    // Calculate appointment metrics
    const totalAppointments = userAppointments.length;
    const confirmedAppointments = userAppointments.filter(apt => apt.status === 'confirmed').length;
    const cancelledAppointments = userAppointments.filter(apt => apt.status === 'cancelled').length;
    const pendingAppointments = userAppointments.filter(apt => apt.status === 'pending').length;
    
    // Filter sales for this person
    const userServiceSales = serviceSales.filter(sale => sale.staffId === person.id);
    const userProductSales = productSales.filter(sale => sale.staffId === person.id);
    
    // Calculate revenue
    const serviceRevenue = userServiceSales.reduce((sum, sale) => sum + (sale.totalPrice || sale.price || 0), 0);
    const productRevenue = userProductSales.reduce((sum, sale) => sum + (sale.totalPrice || 0), 0);
    const totalRevenue = serviceRevenue + productRevenue;
    
    // Calculate commission
    const totalCommission = userServiceSales.reduce((sum, sale) => sum + (sale.commissionAmount || 0), 0) +
                           userProductSales.reduce((sum, sale) => sum + (sale.commissionAmount || 0), 0);
    
    return {
      id: person.id,
      name: person.name,
      role: person.title,
      servicesProvided: userServiceSales.length,
      totalRevenue,
      appointmentsCount: totalAppointments,
      confirmedAppointments,
      cancelledAppointments,
      pendingAppointments,
      productSales: userProductSales.length,
      totalCommission,
      avgRating: 0
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
