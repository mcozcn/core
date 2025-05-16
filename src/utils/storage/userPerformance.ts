
import { getFromStorage, setToStorage } from './core';
import { STORAGE_KEYS } from './storageKeys';

export interface UserPerformance {
  userId: number;
  appointmentCount: number;
  salesCount: number;
  totalSales: number;
}

export interface UserActivity {
  id: number;
  userId: number;
  username: string;
  action: string;
  details: string;
  timestamp: string;
}

export const getUserPerformance = async (): Promise<UserPerformance[]> =>
  await getFromStorage<UserPerformance>(STORAGE_KEYS.USER_PERFORMANCE) || [];

export const setUserPerformance = async (performance: UserPerformance[]): Promise<void> =>
  await setToStorage(STORAGE_KEYS.USER_PERFORMANCE, performance);

export const getUserActivities = async (): Promise<UserActivity[]> =>
  await getFromStorage<UserActivity>(STORAGE_KEYS.USER_ACTIVITIES) || [];

export const setUserActivities = async (activities: UserActivity[]): Promise<void> =>
  await setToStorage(STORAGE_KEYS.USER_ACTIVITIES, activities);

export const addUserActivity = async (activity: Omit<UserActivity, 'id' | 'timestamp'>): Promise<void> => {
  const activities = await getUserActivities();
  
  const newActivity: UserActivity = {
    ...activity,
    id: Date.now(),
    timestamp: new Date().toISOString()
  };

  await setUserActivities([...activities, newActivity]);
};
