import { supabase } from "@/integrations/supabase/client";
import { ensureWriteAllowed } from '@/utils/guestGuard';
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
  const { data, error } = await supabase
    .from('group_schedules')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching group schedules:', error);
    return [];
  }
  
  return (data || []).map(transformDbSchedule);
};

export const setGroupSchedules = async (schedules: GroupSchedule[]): Promise<void> => {
  console.warn('setGroupSchedules is deprecated, use individual CRUD operations');
};

export const addGroupSchedule = async (schedule: Omit<GroupSchedule, 'id' | 'createdAt'>): Promise<GroupSchedule | null> => {
  if (!(await ensureWriteAllowed())) {
    console.warn('Add group schedule blocked: guest users cannot modify data');
    return null;
  }
  
  const dbSchedule = transformToDbSchedule(schedule);
  
  const { data, error } = await supabase
    .from('group_schedules')
    .insert(dbSchedule)
    .select()
    .single();
  
  if (error) {
    console.error('Error adding group schedule:', error);
    return null;
  }
  
  return transformDbSchedule(data);
};

export const updateGroupSchedule = async (id: string | number, updates: Partial<GroupSchedule>): Promise<boolean> => {
  if (!(await ensureWriteAllowed())) {
    console.warn('Update group schedule blocked: guest users cannot modify data');
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
    console.warn('Delete group schedule blocked: guest users cannot modify data');
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
  
  const { data, error } = await supabase
    .from('group_schedules')
    .select('*')
    .eq('time_slot', timeSlot)
    .eq('group_type', groupType)
    .eq('is_active', true);
  
  if (error) {
    console.error('Error fetching schedules by day and time:', error);
    return [];
  }
  
  return (data || []).map(transformDbSchedule);
};