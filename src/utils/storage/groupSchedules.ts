import { supabase } from "@/integrations/supabase/client";
import { ensureWriteAllowed } from '@/utils/guestGuard';
import { getFromStorage, setToStorage } from './core';
import { STORAGE_KEYS } from './storageKeys';
import type { GroupSchedule } from './types';

// Transform database row to GroupSchedule type
const transformDbSchedule = (row: any): GroupSchedule => ({
  id: row.id,
  customerId: row.customer_id,
  customerName: row.customer_name,
  group: row.group_type as 'A' | 'B',
  timeSlot: row.time_slot,
  startDate: new Date(row.start_date),
  isActive: row.is_active,
  createdAt: new Date(row.created_at),
});

// Transform GroupSchedule to database format
const transformToDbSchedule = (schedule: Partial<GroupSchedule>) => ({
  customer_id: String(schedule.customerId),
  customer_name: schedule.customerName,
  group_type: schedule.group,
  time_slot: schedule.timeSlot,
  start_date: schedule.startDate ? new Date(schedule.startDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
  is_active: schedule.isActive ?? true,
});

export const getGroupSchedules = async (): Promise<GroupSchedule[]> => {
  // Try server first
  let serverSchedules: GroupSchedule[] = [];
  try {
    const { data, error } = await supabase
      .from('group_schedules')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    serverSchedules = (data || []).map(transformDbSchedule);
  } catch (err) {
    console.warn('Error fetching group schedules from server, will merge with local storage:', err);
  }

  // Read local schedules
  let localSchedules: GroupSchedule[] = [];
  try {
    const local = await getFromStorage<any>(STORAGE_KEYS.GROUP_SCHEDULES);
    localSchedules = (local || []).map((s: any) => ({
      id: s.id,
      customerId: s.customerId,
      customerName: s.customerName,
      group: s.group,
      timeSlot: s.timeSlot,
      startDate: s.startDate ? new Date(s.startDate) : new Date(),
      isActive: s.isActive ?? true,
      createdAt: s.createdAt ? new Date(s.createdAt) : new Date(),
    }));
  } catch (e) {
    console.warn('Failed reading local group schedules:', e);
  }

  const merged = [...serverSchedules, ...localSchedules];
  merged.sort((a, b) => +new Date(b.createdAt ?? 0) - +new Date(a.createdAt ?? 0));
  return merged;
};

export const setGroupSchedules = async (schedules: GroupSchedule[]): Promise<void> => {
  console.warn('setGroupSchedules is deprecated, use individual CRUD operations');
};

export const addGroupSchedule = async (schedule: Omit<GroupSchedule, 'id' | 'createdAt'>): Promise<GroupSchedule | null> => {
  if (!(await ensureWriteAllowed())) {
    console.warn('Write blocked: write access not allowed in current configuration');
    return null;
  }
  
  const dbSchedule = transformToDbSchedule(schedule);
  
  try {
    const { data, error } = await supabase
      .from('group_schedules')
      .insert(dbSchedule)
      .select()
      .single();

    if (error) throw error;
    return transformDbSchedule(data);
  } catch (err) {
    console.warn('Error adding group schedule to server, saving locally as fallback:', err);
    try {
      const existing = await getFromStorage<any>(STORAGE_KEYS.GROUP_SCHEDULES);
      const localId = `local-${Date.now()}`;
      const localSchedule = {
        id: localId,
        customerId: schedule.customerId,
        customerName: schedule.customerName,
        group: schedule.group,
        timeSlot: schedule.timeSlot,
        startDate: schedule.startDate || new Date(),
        isActive: schedule.isActive ?? true,
        createdAt: new Date(),
      } as GroupSchedule;

      await setToStorage(STORAGE_KEYS.GROUP_SCHEDULES, [...existing, localSchedule as any]);
      return localSchedule;
    } catch (fallbackErr) {
      console.error('Local fallback for adding group schedule failed:', fallbackErr);
      return null;
    }
  }
};

export const updateGroupSchedule = async (id: string | number, updates: Partial<GroupSchedule>): Promise<boolean> => {
  if (!(await ensureWriteAllowed())) {
    console.warn('Write blocked: write access not allowed in current configuration');
    return false;
  }
  
  const dbUpdates: Record<string, any> = {};
  
  if (updates.customerName !== undefined) dbUpdates.customer_name = updates.customerName;
  if (updates.group !== undefined) dbUpdates.group_type = updates.group;
  if (updates.timeSlot !== undefined) dbUpdates.time_slot = updates.timeSlot;
  if (updates.startDate !== undefined) dbUpdates.start_date = new Date(updates.startDate).toISOString().split('T')[0];
  if (updates.isActive !== undefined) dbUpdates.is_active = updates.isActive;
  
  const { error } = await supabase
    .from('group_schedules')
    .update(dbUpdates)
    .eq('id', String(id));
  
  if (error) {
    console.error('Error updating group schedule:', error);
    return false;
  }
  
  return true;
};

export const deleteGroupSchedule = async (id: string | number): Promise<boolean> => {
  if (!(await ensureWriteAllowed())) {
    console.warn('Write blocked: write access not allowed in current configuration');
    return false;
  }
  
  const { error } = await supabase
    .from('group_schedules')
    .delete()
    .eq('id', String(id));
  
  if (error) {
    console.error('Error deleting group schedule:', error);
    return false;
  }
  
  return true;
};

// Get customer's current schedule
export const getCustomerSchedule = async (customerId: string | number): Promise<GroupSchedule | null> => {
  const { data, error } = await supabase
    .from('group_schedules')
    .select('*')
    .eq('customer_id', String(customerId))
    .eq('is_active', true)
    .maybeSingle();
  
  if (error) {
    console.error('Error fetching customer schedule:', error);
    return null;
  }
  
  return data ? transformDbSchedule(data) : null;
};

// Get schedules for a specific day and time slot
export const getSchedulesByDayAndTime = async (
  dayOfWeek: number, // 1=Pazartesi, 2=Salı, ..., 6=Cumartesi
  timeSlot: string
): Promise<GroupSchedule[]> => {
  // Determine which group type matches this day
  // Group A: Monday(1), Wednesday(3), Friday(5)
  // Group B: Tuesday(2), Thursday(4), Saturday(6)
  const groupType = [1, 3, 5].includes(dayOfWeek) ? 'A' : 'B';
  try {
    const { data, error } = await supabase
      .from('group_schedules')
      .select('*')
      .eq('time_slot', timeSlot)
      .eq('group_type', groupType)
      .eq('is_active', true);

    if (error) throw error;
    return (data || []).map(transformDbSchedule);
  } catch (err) {
    console.warn('Server fetch for schedules failed, falling back to local schedules:', err);
    try {
      const local = await getFromStorage<any>(STORAGE_KEYS.GROUP_SCHEDULES);
      return (local || [])
        .filter((s: any) => s.timeSlot === timeSlot && s.group === groupType && (s.isActive ?? true))
        .map((s: any) => ({
          id: s.id,
          customerId: s.customerId,
          customerName: s.customerName,
          group: s.group,
          timeSlot: s.timeSlot,
          startDate: s.startDate ? new Date(s.startDate) : new Date(),
          isActive: s.isActive ?? true,
          createdAt: s.createdAt ? new Date(s.createdAt) : new Date(),
        }));
    } catch (e) {
      console.warn('Failed reading local group schedules:', e);
      return [];
    }
  }
};