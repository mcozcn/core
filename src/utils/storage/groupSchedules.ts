import { getFromStorage, setToStorage } from './core';
import { STORAGE_KEYS } from './storageKeys';
import type { GroupSchedule } from './types';

export const getGroupSchedules = async (): Promise<GroupSchedule[]> => {
  const result = await getFromStorage<GroupSchedule>(STORAGE_KEYS.GROUP_SCHEDULES);
  return result as GroupSchedule[];
};

export const setGroupSchedules = async (schedules: GroupSchedule[]): Promise<void> => {
  await setToStorage(STORAGE_KEYS.GROUP_SCHEDULES, schedules);
};

export const addGroupSchedule = async (schedule: Omit<GroupSchedule, 'id' | 'createdAt'>): Promise<GroupSchedule> => {
  const schedules = await getGroupSchedules();
  const newSchedule: GroupSchedule = {
    ...schedule,
    id: Date.now(),
    createdAt: new Date(),
  };
  await setGroupSchedules([...schedules, newSchedule]);
  return newSchedule;
};

export const updateGroupSchedule = async (id: string | number, updates: Partial<GroupSchedule>): Promise<void> => {
  const schedules = await getGroupSchedules();
  const updatedSchedules = schedules.map(schedule =>
    schedule.id === id ? { ...schedule, ...updates } : schedule
  );
  await setGroupSchedules(updatedSchedules);
};

export const deleteGroupSchedule = async (id: string | number): Promise<void> => {
  const schedules = await getGroupSchedules();
  await setGroupSchedules(schedules.filter(schedule => schedule.id !== id));
};

// Get customer's current schedule
export const getCustomerSchedule = async (customerId: string | number): Promise<GroupSchedule | null> => {
  const schedules = await getGroupSchedules();
  return schedules.find(s => s.customerId === customerId && s.isActive) || null;
};

// Get schedules for a specific day and time slot
export const getSchedulesByDayAndTime = async (
  dayOfWeek: number, // 1=Pazartesi, 2=Salı, ..., 6=Cumartesi
  timeSlot: string
): Promise<GroupSchedule[]> => {
  const schedules = await getGroupSchedules();
  const activeSchedules = schedules.filter(schedule => schedule.isActive);
  
  return activeSchedules.filter(schedule => {
    const group = schedule.group;
    const matchesTime = schedule.timeSlot === timeSlot;
    
    // Grup A: Pazartesi(1), Çarşamba(3), Cuma(5)
    // Grup B: Salı(2), Perşembe(4), Cumartesi(6)
    const matchesDay = (group === 'A' && [1, 3, 5].includes(dayOfWeek)) ||
                       (group === 'B' && [2, 4, 6].includes(dayOfWeek));
    
    return matchesTime && matchesDay;
  });
};
