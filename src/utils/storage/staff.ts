
import { getFromStorage, setToStorage } from './core';
import { STORAGE_KEYS } from './storageKeys';
import type { StaffPerformance } from './types';

export const getStaffPerformance = async (): Promise<StaffPerformance[]> => {
  const result = await getFromStorage<StaffPerformance[]>(STORAGE_KEYS.STAFF);
  
  // Ensure avgRating is a number
  if (result && Array.isArray(result)) {
    return result.map(staff => ({
      ...staff,
      avgRating: typeof staff.avgRating === 'string' ? parseFloat(staff.avgRating) : staff.avgRating
    }));
  }
  
  return [];
};

export const setStaffPerformance = async (staff: StaffPerformance[]): Promise<void> => {
  await setToStorage(STORAGE_KEYS.STAFF, staff);
};
