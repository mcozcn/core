
import { getFromStorage, setToStorage } from './core';
import { STORAGE_KEYS } from './storageKeys';
import type { StaffPerformance } from './types';
import { getPersonnel } from './personnel';
import { getAppointments } from './appointments';
import { getServiceSales } from './services';
import { getSales } from './stock';

// Eski demo verilerini temizle
const clearOldStaffData = async (): Promise<void> => {
  try {
    localStorage.removeItem('staff_v1');
    localStorage.removeItem('staff');
    localStorage.removeItem('staffPerformance');
  } catch (error) {
    console.log('Error clearing old staff data:', error);
  }
};

export const getStaffPerformance = async (
  startDate?: Date, 
  endDate?: Date
): Promise<StaffPerformance[]> => {
  // İlk çalıştırmada eski verileri temizle
  await clearOldStaffData();
  
  // Get personnel from personnel section instead of users
  const personnel = await getPersonnel();
  
  // Eğer personel yoksa boş liste döndür
  if (!personnel || personnel.length === 0) {
    console.log('No personnel found, returning empty staff performance');
    return [];
  }
  
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
    
    const staffData: StaffPerformance = {
      id: person.id,
      staffId: person.id,
      staffName: person.name,
      name: person.name,
      role: person.title,
      date: new Date(),
      appointmentsCompleted: confirmedAppointments,
      appointmentsCount: totalAppointments,
      confirmedAppointments,
      cancelledAppointments,
      pendingAppointments,
      servicesProvided: userServiceSales.length,
      productSales: userProductSales.length,
      salesAmount: totalRevenue,
      totalRevenue,
      totalCommission,
      avgRating: 0
    };
    
    return staffData;
  }));
  
  console.log('Staff performance calculated:', staffPerformance);
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
        servicesProvided: (staff.servicesProvided || 0) + serviceCount,
        totalRevenue: (staff.totalRevenue || 0) + revenue
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
        appointmentsCount: (staff.appointmentsCount || 0) + appointmentCount
      };
    }
    return staff;
  });
  
  await setStaffPerformance(updatedStaffList);
};
