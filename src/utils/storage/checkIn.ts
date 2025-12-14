import { supabase } from "@/integrations/supabase/client";

export interface CheckInRecord {
  id: string | number;
  memberId: string | number;
  memberName: string;
  checkInTime: Date;
  checkOutTime?: Date;
  duration?: number; // in minutes
  notes?: string;
  createdAt: Date;
}

const transformDbCheckIn = (row: any): CheckInRecord => ({
  id: row.id,
  memberId: row.customer_id,
  memberName: '', // Will be populated from customer data if needed
  checkInTime: new Date(row.check_in_time),
  checkOutTime: row.check_out_time ? new Date(row.check_out_time) : undefined,
  duration: row.check_out_time 
    ? Math.floor((new Date(row.check_out_time).getTime() - new Date(row.check_in_time).getTime()) / 60000)
    : undefined,
  notes: row.notes || '',
  createdAt: new Date(row.created_at),
});

export const getCheckInRecords = async (): Promise<CheckInRecord[]> => {
  const { data, error } = await supabase
    .from('check_ins')
    .select('*')
    .order('check_in_time', { ascending: false });
  
  if (error) {
    console.error('Error fetching check-ins:', error);
    return [];
  }
  
  return (data || []).map(transformDbCheckIn);
};

export const checkInMember = async (memberId: number | string, memberName: string, notes?: string): Promise<boolean> => {
  try {
    // Check if member is already checked in
    const { data: existing } = await supabase
      .from('check_ins')
      .select('id')
      .eq('customer_id', String(memberId))
      .is('check_out_time', null)
      .single();
    
    if (existing) {
      console.warn('Member is already checked in');
      return false;
    }
    
    const { error } = await supabase
      .from('check_ins')
      .insert({
        customer_id: String(memberId),
        notes: notes || null,
        check_in_time: new Date().toISOString(),
      });
    
    if (error) {
      console.error('Error checking in member:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error checking in member:', error);
    return false;
  }
};

export const checkOutMember = async (memberId: number | string): Promise<boolean> => {
  try {
    const { data: record, error: fetchError } = await supabase
      .from('check_ins')
      .select('id')
      .eq('customer_id', String(memberId))
      .is('check_out_time', null)
      .single();
    
    if (fetchError || !record) {
      console.warn('No active check-in found for member');
      return false;
    }
    
    const { error } = await supabase
      .from('check_ins')
      .update({ check_out_time: new Date().toISOString() })
      .eq('id', record.id);
    
    if (error) {
      console.error('Error checking out member:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error checking out member:', error);
    return false;
  }
};

export const getCurrentCheckIns = async (): Promise<CheckInRecord[]> => {
  const { data, error } = await supabase
    .from('check_ins')
    .select('*')
    .is('check_out_time', null)
    .order('check_in_time', { ascending: false });
  
  if (error) {
    console.error('Error fetching current check-ins:', error);
    return [];
  }
  
  return (data || []).map(transformDbCheckIn);
};

export const getTodayCheckIns = async (): Promise<CheckInRecord[]> => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const { data, error } = await supabase
    .from('check_ins')
    .select('*')
    .gte('check_in_time', today.toISOString())
    .order('check_in_time', { ascending: false });
  
  if (error) {
    console.error('Error fetching today check-ins:', error);
    return [];
  }
  
  return (data || []).map(transformDbCheckIn);
};
