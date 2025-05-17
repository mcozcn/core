
import { getFromStorage, setToStorage } from './core';
import { STORAGE_KEYS } from './storageKeys';
import type { StaffPerformance } from './types';
import { getAllUsers } from '@/utils/auth';

export const getStaffPerformance = async (
  startDate?: Date, 
  endDate?: Date
): Promise<StaffPerformance[]> => {
  const result = await getFromStorage<StaffPerformance>(STORAGE_KEYS.STAFF);
  
  // Ensure we have an array and avgRating is a number
  let staffPerformance = [];
  if (Array.isArray(result)) {
    staffPerformance = result.map((staff: any) => ({
      ...staff,
      avgRating: typeof staff.avgRating === 'string' ? parseFloat(staff.avgRating) : staff.avgRating
    })) as StaffPerformance[];
  }
  
  // If no data, create default entries for all staff
  if (staffPerformance.length === 0) {
    const users = getAllUsers().filter(user => user.role === 'staff');
    staffPerformance = users.map(user => ({
      id: user.id,
      name: user.displayName || user.username,
      role: user.title || 'Personel',
      servicesProvided: 0,
      totalRevenue: 0,
      appointmentsCount: 0,
      avgRating: 0
    }));
    
    // Save the default data
    await setToStorage(STORAGE_KEYS.STAFF, staffPerformance);
  }
  
  // Filter by date range if provided
  if (startDate && endDate) {
    // In a real app, you would filter the data by date range
    // This is placeholder for demonstration
  }
  
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

export const updateStaffRating = async (
  staffId: number, 
  rating: number
): Promise<void> => {
  const staffList = await getStaffPerformance();
  
  const targetStaff = staffList.find(staff => staff.id === staffId);
  if (!targetStaff) return;
  
  const updatedStaffList = staffList.map(staff => {
    if (staff.id === staffId) {
      // Calculate new average rating
      const oldRatingTotal = staff.avgRating * (staff.servicesProvided || 1);
      const newRatingTotal = oldRatingTotal + rating;
      const newAvgRating = newRatingTotal / (staff.servicesProvided + 1);
      
      return {
        ...staff,
        avgRating: parseFloat(newAvgRating.toFixed(2))
      };
    }
    return staff;
  });
  
  await setStaffPerformance(updatedStaffList);
};
