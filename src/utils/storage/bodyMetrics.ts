import { supabase } from "@/integrations/supabase/client";

export interface BodyMetric {
  id: string | number;
  memberId: string | number;
  memberName: string;
  date: Date;
  weight: number; // kg
  height?: number; // cm
  bodyFat?: number; // percentage
  muscleMass?: number; // kg
  bmi?: number;
  chest?: number; // cm
  waist?: number; // cm
  hips?: number; // cm
  biceps?: number; // cm (mapped to arm)
  thighs?: number; // cm
  notes?: string;
  photos?: string[]; // URLs to progress photos
  createdAt: Date;
}

const transformDbMetric = (row: any): BodyMetric => {
  const weight = row.weight || 0;
  const height = row.height || 0;
  const bmi = height > 0 ? Number((weight / ((height / 100) * (height / 100))).toFixed(1)) : undefined;
  
  return {
    id: row.id,
    memberId: row.customer_id,
    memberName: '',
    date: new Date(row.measurement_date),
    weight: row.weight || 0,
    bodyFat: row.body_fat_percentage,
    muscleMass: row.muscle_mass,
    bmi,
    chest: row.chest,
    waist: row.waist,
    hips: row.hips,
    biceps: row.arm,
    thighs: row.thigh,
    notes: row.notes || '',
    createdAt: new Date(row.created_at),
  };
};

const transformToDbMetric = (metric: Partial<BodyMetric>) => ({
  customer_id: String(metric.memberId),
  measurement_date: metric.date ? new Date(metric.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
  weight: metric.weight || null,
  body_fat_percentage: metric.bodyFat || null,
  muscle_mass: metric.muscleMass || null,
  chest: metric.chest || null,
  waist: metric.waist || null,
  hips: metric.hips || null,
  arm: metric.biceps || null,
  thigh: metric.thighs || null,
  notes: metric.notes || null,
});

export const getBodyMetrics = async (): Promise<BodyMetric[]> => {
  const { data, error } = await supabase
    .from('body_metrics')
    .select('*')
    .order('measurement_date', { ascending: false });
  
  if (error) {
    console.error('Error fetching body metrics:', error);
    return [];
  }
  
  return (data || []).map(transformDbMetric);
};

export const getMemberBodyMetrics = async (memberId: number | string): Promise<BodyMetric[]> => {
  const { data, error } = await supabase
    .from('body_metrics')
    .select('*')
    .eq('customer_id', String(memberId))
    .order('measurement_date', { ascending: false });
  
  if (error) {
    console.error('Error fetching member body metrics:', error);
    return [];
  }
  
  return (data || []).map(transformDbMetric);
};

export const saveBodyMetric = async (metric: Omit<BodyMetric, 'id' | 'createdAt' | 'bmi'>): Promise<boolean> => {
  const dbMetric = transformToDbMetric(metric);
  
  const { error } = await supabase
    .from('body_metrics')
    .insert(dbMetric);
  
  if (error) {
    console.error('Error saving body metric:', error);
    return false;
  }
  
  return true;
};

export const updateBodyMetric = async (id: number | string, updates: Partial<BodyMetric>): Promise<boolean> => {
  const dbUpdates: Record<string, any> = {};
  
  if (updates.weight !== undefined) dbUpdates.weight = updates.weight;
  if (updates.bodyFat !== undefined) dbUpdates.body_fat_percentage = updates.bodyFat;
  if (updates.muscleMass !== undefined) dbUpdates.muscle_mass = updates.muscleMass;
  if (updates.chest !== undefined) dbUpdates.chest = updates.chest;
  if (updates.waist !== undefined) dbUpdates.waist = updates.waist;
  if (updates.hips !== undefined) dbUpdates.hips = updates.hips;
  if (updates.biceps !== undefined) dbUpdates.arm = updates.biceps;
  if (updates.thighs !== undefined) dbUpdates.thigh = updates.thighs;
  if (updates.notes !== undefined) dbUpdates.notes = updates.notes;
  
  const { error } = await supabase
    .from('body_metrics')
    .update(dbUpdates)
    .eq('id', String(id));
  
  if (error) {
    console.error('Error updating body metric:', error);
    return false;
  }
  
  return true;
};

export const deleteBodyMetric = async (id: number | string): Promise<boolean> => {
  const { error } = await supabase
    .from('body_metrics')
    .delete()
    .eq('id', String(id));
  
  if (error) {
    console.error('Error deleting body metric:', error);
    return false;
  }
  
  return true;
};

export const getLatestBodyMetric = async (memberId: number | string): Promise<BodyMetric | null> => {
  const { data, error } = await supabase
    .from('body_metrics')
    .select('*')
    .eq('customer_id', String(memberId))
    .order('measurement_date', { ascending: false })
    .limit(1)
    .single();
  
  if (error || !data) {
    return null;
  }
  
  return transformDbMetric(data);
};
