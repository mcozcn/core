
import { getFromStorage, setToStorage } from './core';
import { STORAGE_KEYS } from './storageKeys';
import type { StaffPerformance } from './types';

export const getStaffPerformance = async (): Promise<StaffPerformance[]> => {
  const result = await getFromStorage<StaffPerformance>(STORAGE_KEYS.STAFF);
  
  // Ensure we have an array and avgRating is a number
  if (Array.isArray(result)) {
    return result.map((staff: any) => ({
      ...staff,
      avgRating: typeof staff.avgRating === 'string' ? parseFloat(staff.avgRating) : staff.avgRating
    })) as StaffPerformance[];
  }
  
  return [];
};

export const setStaffPerformance = async (staff: StaffPerformance[]): Promise<void> => {
  await setToStorage(STORAGE_KEYS.STAFF, staff);
};
