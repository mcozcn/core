import { supabase } from "@/integrations/supabase/client";
import type { Payment } from './types';

const transformDbPayment = (row: any): Payment => ({
  id: row.id,
  customerId: row.customer_id,
  amount: row.amount,
  paymentType: row.payment_type,
  method: row.payment_type,
  paymentDate: new Date(row.payment_date),
  date: new Date(row.payment_date),
  dueDate: row.due_date ? new Date(row.due_date) : undefined,
  isPaid: row.is_paid,
  notes: row.notes || '',
  createdAt: new Date(row.created_at),
});

const transformToDbPayment = (payment: Partial<Payment>) => ({
  customer_id: String(payment.customerId),
  amount: payment.amount,
  payment_type: payment.paymentType || payment.method || 'nakit',
  payment_date: payment.paymentDate || payment.date 
    ? new Date(payment.paymentDate || payment.date!).toISOString().split('T')[0] 
    : new Date().toISOString().split('T')[0],
  due_date: payment.dueDate ? new Date(payment.dueDate).toISOString().split('T')[0] : null,
  is_paid: payment.isPaid ?? false,
  notes: payment.notes || null,
});

export const getPayments = async (): Promise<Payment[]> => {
  const { data, error } = await supabase
    .from('payments')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching payments:', error);
    return [];
  }
  
  return (data || []).map(transformDbPayment);
};

export const setPayments = async (payments: Payment[]): Promise<void> => {
  console.warn('setPayments is deprecated, use individual CRUD operations');
};

export const addPayment = async (payment: Omit<Payment, 'id' | 'createdAt'>): Promise<Payment | null> => {
  const dbPayment = transformToDbPayment(payment);
  
  const { data, error } = await supabase
    .from('payments')
    .insert(dbPayment)
    .select()
    .single();
  
  if (error) {
    console.error('Error adding payment:', error);
    return null;
  }
  
  return transformDbPayment(data);
};

export const updatePayment = async (id: string | number, updates: Partial<Payment>): Promise<boolean> => {
  const dbUpdates: Record<string, any> = {};
  
  if (updates.amount !== undefined) dbUpdates.amount = updates.amount;
  if (updates.paymentType !== undefined || updates.method !== undefined) {
    dbUpdates.payment_type = updates.paymentType || updates.method;
  }
  if (updates.isPaid !== undefined) dbUpdates.is_paid = updates.isPaid;
  if (updates.notes !== undefined) dbUpdates.notes = updates.notes;
  if (updates.dueDate !== undefined) {
    dbUpdates.due_date = updates.dueDate ? new Date(updates.dueDate).toISOString().split('T')[0] : null;
  }
  
  const { error } = await supabase
    .from('payments')
    .update(dbUpdates)
    .eq('id', String(id));
  
  if (error) {
    console.error('Error updating payment:', error);
    return false;
  }
  
  return true;
};

export const deletePayment = async (id: string | number): Promise<boolean> => {
  const { error } = await supabase
    .from('payments')
    .delete()
    .eq('id', String(id));
  
  if (error) {
    console.error('Error deleting payment:', error);
    return false;
  }
  
  return true;
};
