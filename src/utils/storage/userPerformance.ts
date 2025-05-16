
import { getFromStorage, setToStorage } from './core';
import { STORAGE_KEYS } from './storageKeys';
import type { UserPerformance, UserActivity } from './types';

export const getUserPerformance = async (): Promise<UserPerformance[]> => {
  const result = await getFromStorage<UserPerformance>(STORAGE_KEYS.USER_PERFORMANCE);
  return result as UserPerformance[];
};

export const setUserPerformance = async (performance: UserPerformance[]): Promise<void> => {
  await setToStorage(STORAGE_KEYS.USER_PERFORMANCE, performance);
};

export const getUserActivities = async (): Promise<UserActivity[]> => {
  const result = await getFromStorage<UserActivity>(STORAGE_KEYS.USER_ACTIVITIES);
  return result as UserActivity[];
};

export const setUserActivities = async (activities: UserActivity[]): Promise<void> => {
  await setToStorage(STORAGE_KEYS.USER_ACTIVITIES, activities);
};

export const addUserActivity = async (activity: Omit<UserActivity, 'id' | 'timestamp'>): Promise<void> => {
  const activities = await getUserActivities();
  
  const newActivity: UserActivity = {
    ...activity,
    id: Date.now(),
    timestamp: new Date().toISOString()
  };

  await setUserActivities([...activities, newActivity]);
};
