
import { getFromStorage, setToStorage } from './core';
import { STORAGE_KEYS } from './storageKeys';
import type { StaffPerformance } from './types';
import { getPersonnel } from './personnel';
import { getAppointments } from './appointments';
import { getServiceSales } from './services';
import { getSales } from './stock';

// Tüm eski staff verilerini temizle
const clearOldStaffData = async (): Promise<void> => {
  try {
    // LocalStorage temizliği
    const keysToRemove = [
      'staff_v1', 'staff', 'staffPerformance', 'staffPerformance_v1', 
      'staffPerformance_v2', 'staffPerformance_v3'
    ];
    
    keysToRemove.forEach(key => {
      localStorage.removeItem(key);
    });

    // IndexedDB temizliği
    if (typeof window !== 'undefined' && window.indexedDB) {
      try {
        const deleteRequest = indexedDB.deleteDatabase('salon-storage');
        deleteRequest.onsuccess = () => console.log('Old IndexedDB cleared');
      } catch (error) {
        console.log('IndexedDB cleanup error:', error);
      }
    }
  } catch (error) {
    console.log('Error clearing old staff data:', error);
  }
};

export const getStaffPerformance = async (
  startDate?: Date, 
  endDate?: Date
): Promise<StaffPerformance[]> => {
  try {
    console.log('=== Starting getStaffPerformance ===');
    
    // İlk çalıştırmada eski verileri temizle
    await clearOldStaffData();
    
    // Get personnel data with error handling
    let personnel;
    try {
      personnel = await getPersonnel();
      console.log('✅ Personnel loaded successfully:', personnel);
    } catch (error) {
      console.error('❌ Error loading personnel:', error);
      // Fallback: return empty array if personnel can't be loaded
      return [];
    }
    
    // Eğer personel yoksa boş liste döndür
    if (!personnel || personnel.length === 0) {
      console.log('⚠️ No personnel found, returning empty performance data');
      return [];
    }
    
    // Get other data with error handling
    let appointments = [];
    let serviceSales = [];
    let productSales = [];
    
    try {
      [appointments, serviceSales, productSales] = await Promise.all([
        getAppointments().catch(() => []),
        getServiceSales().catch(() => []),
        getSales().catch(() => [])
      ]);
      
      console.log('📊 Data loaded:', {
        personnelCount: personnel.length,
        appointmentsCount: appointments.length,
        serviceSalesCount: serviceSales.length,
        productSalesCount: productSales.length
      });
    } catch (error) {
      console.error('❌ Error loading performance data:', error);
    }
    
    // Calculate performance for each personnel
    const staffPerformance = personnel.map((person) => {
      console.log(`🔄 Processing: ${person.name} (ID: ${person.id})`);
      
      // Filter appointments for this person
      const userAppointments = appointments.filter(apt => {
        const match = apt.staffId === person.id || 
                     apt.staffName === person.name ||
                     apt.staffId === person.id.toString();
        if (match) {
          console.log(`✅ Appointment match for ${person.name}: ${apt.id}`);
        }
        return match;
      });
      
      // Filter service sales for this person
      const userServiceSales = serviceSales.filter(sale => {
        const match = sale.staffId === person.id || 
                     sale.staffName === person.name ||
                     sale.staffId === person.id.toString();
        if (match) {
          console.log(`✅ Service sale match for ${person.name}: ${sale.id}`);
        }
        return match;
      });
      
      // Filter product sales for this person
      const userProductSales = productSales.filter(sale => {
        const match = sale.staffId === person.id || 
                     sale.staffName === person.name ||
                     sale.staffId === person.id.toString();
        if (match) {
          console.log(`✅ Product sale match for ${person.name}: ${sale.id}`);
        }
        return match;
      });
      
      // Calculate metrics
      const totalAppointments = userAppointments.length;
      const confirmedAppointments = userAppointments.filter(apt => apt.status === 'confirmed').length;
      const cancelledAppointments = userAppointments.filter(apt => apt.status === 'cancelled').length;
      const pendingAppointments = userAppointments.filter(apt => apt.status === 'pending').length;
      
      // Calculate revenue
      const serviceRevenue = userServiceSales.reduce((sum, sale) => sum + (sale.totalPrice || sale.price || 0), 0);
      const productRevenue = userProductSales.reduce((sum, sale) => sum + (sale.totalPrice || 0), 0);
      const totalRevenue = serviceRevenue + productRevenue;
      
      // Calculate commission
      const calculatedCommission = totalRevenue * ((person.commissionRate || 0) / 100);
      const existingCommission = userServiceSales.reduce((sum, sale) => sum + (sale.commissionAmount || 0), 0) +
                                userProductSales.reduce((sum, sale) => sum + (sale.commissionAmount || 0), 0);
      const totalCommission = existingCommission + calculatedCommission;
      
      const staffData: StaffPerformance = {
        id: person.id,
        staffId: person.id,
        staffName: person.name,
        name: person.name,
        role: person.title || 'Personel',
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
      
      console.log(`📈 Performance calculated for ${person.name}:`, {
        appointments: totalAppointments,
        services: userServiceSales.length,
        products: userProductSales.length,
        revenue: totalRevenue,
        commission: totalCommission
      });
      
      return staffData;
    });
    
    console.log('✅ Final staff performance calculated:', staffPerformance);
    return staffPerformance;
    
  } catch (error) {
    console.error('❌ Critical error in getStaffPerformance:', error);
    return [];
  }
};

export const setStaffPerformance = async (staff: StaffPerformance[]): Promise<void> => {
  try {
    await setToStorage(STORAGE_KEYS.STAFF, staff);
  } catch (error) {
    console.error('Error setting staff performance:', error);
  }
};

export const updateStaffServiceCount = async (
  staffId: number, 
  serviceCount: number = 1, 
  revenue: number = 0
): Promise<void> => {
  try {
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
  } catch (error) {
    console.error('Error updating staff service count:', error);
  }
};

export const updateStaffAppointmentCount = async (
  staffId: number, 
  appointmentCount: number = 1
): Promise<void> => {
  try {
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
  } catch (error) {
    console.error('Error updating staff appointment count:', error);
  }
};
