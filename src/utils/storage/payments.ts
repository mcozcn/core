import { supabase } from "@/integrations/supabase/client";
import { ensureWriteAllowed } from '@/utils/guestGuard';
import { getFromStorage, setToStorage } from './core';
import { STORAGE_KEYS } from './storageKeys';
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
  // Try server first
  let serverPayments: Payment[] = [];
  try {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    serverPayments = (data || []).map(transformDbPayment);
  } catch (err) {
    console.warn('Error fetching payments from server, falling back to local:', err);
  }

  // Read local payments and merge
  let localPayments: Payment[] = [];
  try {
    const local = await getFromStorage<any>(STORAGE_KEYS.PAYMENTS);
    localPayments = (local || []).map((p: any) => ({
      id: p.id,
      customerId: p.customerId,
      customerName: p.customerName,
      amount: p.amount,
      paymentDate: p.paymentDate ? new Date(p.paymentDate) : new Date(),
      date: p.date ? new Date(p.date) : new Date(),
      dueDate: p.dueDate ? new Date(p.dueDate) : undefined,
      isPaid: p.isPaid,
      notes: p.notes || '',
      createdAt: p.createdAt ? new Date(p.createdAt) : new Date(),
    }));
  } catch (e) {
    console.warn('Failed reading local payments:', e);
  }

  const merged = [...localPayments, ...serverPayments];
  merged.sort((a, b) => +new Date(b.createdAt ?? 0) - +new Date(a.createdAt ?? 0));
  return merged;
};

export const setPayments = async (payments: Payment[]): Promise<void> => {
  console.warn('setPayments is deprecated, use individual CRUD operations');
};

export const addPayment = async (payment: Omit<Payment, 'id' | 'createdAt'>): Promise<Payment | null> => {
  if (!(await ensureWriteAllowed())) {
    console.warn('Write blocked: write access not allowed in current configuration');
    return null;
  }
  const dbPayment = transformToDbPayment(payment);
  
  try {
    const { data, error } = await supabase
      .from('payments')
      .insert(dbPayment)
      .select()
      .single();

    if (error) throw error;
    return transformDbPayment(data);
  } catch (err) {
    console.warn('Error adding payment to server, saving locally as fallback:', err);
    try {
      const existing = await getFromStorage<any>(STORAGE_KEYS.PAYMENTS);
      const localId = `local-${Date.now()}`;
      const localPayment = {
        id: localId,
        customerId: payment.customerId,
        customerName: payment.customerName,
        amount: payment.amount,
        paymentDate: payment.paymentDate || payment.date || new Date(),
        date: payment.date || payment.paymentDate || new Date(),
        dueDate: payment.dueDate,
        isPaid: payment.isPaid ?? false,
        notes: payment.notes || '',
        createdAt: new Date(),
      } as Payment;

      await setToStorage(STORAGE_KEYS.PAYMENTS, [...existing, localPayment as any]);
      try {
        const local = await import('@/utils/localStorage');
        const localPayments = local.getPayments();
        local.setPayments([...localPayments, localPayment as any]);
      } catch (syncErr) {
        console.warn('Local synchronous save after payment fallback failed:', syncErr);
      }

      return localPayment;
    } catch (fallbackErr) {
      console.error('Local fallback for adding payment failed:', fallbackErr);
      return null;
    }
  }
};

export const updatePayment = async (id: string | number, updates: Partial<Payment>): Promise<boolean> => {
  if (!(await ensureWriteAllowed())) {
    console.warn('Write blocked: write access not allowed in current configuration');
    return false;
  }
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
  if (!(await ensureWriteAllowed())) {
    console.warn('Write blocked: write access not allowed in current configuration');
    return false;
  }
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
