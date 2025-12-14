import { supabase } from "@/integrations/supabase/client";
import { ensureWriteAllowed } from '@/utils/guestGuard';
import type { Cost } from './types';

const transformDbCost = (row: any): Cost => ({
  id: row.id,
  name: row.description || row.category,
  category: row.category,
  amount: row.amount,
  description: row.description || '',
  notes: row.notes || '',
  personnelId: row.personnel_id,
  date: new Date(row.cost_date),
  costDate: new Date(row.cost_date),
  createdAt: new Date(row.created_at),
});

const transformToDbCost = (cost: Partial<Cost>) => ({
  category: cost.category || 'Genel',
  amount: cost.amount,
  description: cost.description || cost.name || null,
  notes: cost.notes || null,
  personnel_id: cost.personnelId ? String(cost.personnelId) : null,
  cost_date: cost.costDate || cost.date 
    ? new Date(cost.costDate || cost.date!).toISOString().split('T')[0] 
    : new Date().toISOString().split('T')[0],
});

export const getCosts = async (): Promise<Cost[]> => {
  const { data, error } = await supabase
    .from('costs')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching costs:', error);
    return [];
  }
  
  return (data || []).map(transformDbCost);
};

export const setCosts = async (costs: Cost[]): Promise<void> => {
  console.warn('setCosts is deprecated, use individual CRUD operations');
};

export const addCost = async (cost: Omit<Cost, 'id' | 'createdAt'>): Promise<Cost | null> => {
  if (!(await ensureWriteAllowed())) {
    console.warn('Add cost blocked: guest users cannot modify data');
    return null;
  }
  const dbCost = transformToDbCost(cost);
  
  const { data, error } = await supabase
    .from('costs')
    .insert(dbCost)
    .select()
    .single();
  
  if (error) {
    console.error('Error adding cost:', error);
    return null;
  }
  
  return transformDbCost(data);
};

export const updateCost = async (id: string | number, updates: Partial<Cost>): Promise<boolean> => {
  if (!(await ensureWriteAllowed())) {
    console.warn('Update cost blocked: guest users cannot modify data');
    return false;
  }
  const dbUpdates: Record<string, any> = {};
  
  if (updates.category !== undefined) dbUpdates.category = updates.category;
  if (updates.amount !== undefined) dbUpdates.amount = updates.amount;
  if (updates.description !== undefined) dbUpdates.description = updates.description;
  if (updates.notes !== undefined) dbUpdates.notes = updates.notes;
  
  const { error } = await supabase
    .from('costs')
    .update(dbUpdates)
    .eq('id', String(id));
  
  if (error) {
    console.error('Error updating cost:', error);
    return false;
  }
  
  return true;
};

export const deleteCost = async (id: string | number): Promise<boolean> => {
  if (!(await ensureWriteAllowed())) {
    console.warn('Delete cost blocked: guest users cannot modify data');
    return false;
  }
  const { error } = await supabase
    .from('costs')
    .delete()
    .eq('id', String(id));
  
  if (error) {
    console.error('Error deleting cost:', error);
    return false;
  }
  
  return true;
};
