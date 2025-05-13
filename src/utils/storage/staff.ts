
import { getFromStorage, setToStorage } from './core';
import { STORAGE_KEYS } from './storageKeys';
import { getAppointments } from './appointments';
import { getServiceSales } from './services';
import type { StaffPerformance } from './types';

// Mock staff data - in a real app, these would be in the database
const mockStaff = [
  { id: 1, name: "Ayşe Yılmaz", role: "Stilist" },
  { id: 2, name: "Mehmet Kaya", role: "Kuaför" },
  { id: 3, name: "Zeynep Demir", role: "Manikür Uzmanı" },
  { id: 4, name: "Ali Öztürk", role: "Masör" }
];

// Mock staff service assignments
const staffServiceMappings = [
  { staffId: 1, serviceIds: [1, 3, 5] },
  { staffId: 2, serviceIds: [1, 2, 4] },
  { staffId: 3, serviceIds: [6, 7] },
  { staffId: 4, serviceIds: [8, 9, 10] }
];

export const getStaff = () => {
  return mockStaff;
};

export const getStaffServices = () => {
  return staffServiceMappings;
};

export const getStaffPerformance = (periodInDays: number = 30): StaffPerformance[] => {
  const appointments = getAppointments();
  const serviceSales = getServiceSales();
  
  // Filter by period
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - periodInDays);
  
  const filteredSales = serviceSales.filter(sale => 
    new Date(sale.saleDate) >= cutoffDate
  );
  
  return mockStaff.map(staff => {
    // Get services assigned to this staff member
    const staffServiceIds = staffServiceMappings
      .find(s => s.staffId === staff.id)?.serviceIds || [];
    
    // Filter sales by services this staff member provides
    const staffSales = filteredSales.filter(sale => 
      staffServiceIds.includes(sale.serviceId)
    );
    
    // Filter appointments handled by this staff
    const staffAppointments = appointments.filter(
      apt => apt.staffId === staff.id && new Date(`${apt.date}T${apt.time}`) >= cutoffDate
    );
    
    const servicesProvided = staffSales.length;
    const totalRevenue = staffSales.reduce((sum, sale) => sum + sale.price, 0);
    const appointmentsCount = staffAppointments.length;
    
    // Calculate average rating (from appointments with ratings)
    // For now using mock data between 4-5, but in a real app would use actual ratings
    const avgRating = (4 + Math.random()).toFixed(1);
    
    return {
      ...staff,
      servicesProvided,
      totalRevenue,
      appointmentsCount,
      avgRating: parseFloat(avgRating) > 5 ? '5.0' : avgRating
    };
  }).sort((a, b) => b.totalRevenue - a.totalRevenue);
};
