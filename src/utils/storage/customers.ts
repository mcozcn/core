import { supabase } from "@/integrations/supabase/client";
import { ensureWriteAllowed } from '@/utils/guestGuard';
import type { Customer, CustomerRecord } from './types';

// Transform database row to Customer type
const transformDbCustomer = (row: any): Customer => ({
  id: row.id,
  name: `${row.first_name} ${row.last_name}`,
  firstName: row.first_name,
  lastName: row.last_name,
  phone: row.phone || '',
  email: row.email || '',
  notes: row.notes || '',
  address: row.address || '',
  gender: row.gender || '',
  birthDate: row.birth_date ? new Date(row.birth_date) : undefined,
  totalDebt: row.total_debt || 0,
  isActive: row.is_active,
  membershipPackageId: row.membership_package_id,
  membershipStartDate: row.membership_start_date ? new Date(row.membership_start_date) : undefined,
  membershipEndDate: row.membership_end_date ? new Date(row.membership_end_date) : undefined,
  groupNumber: row.group_number,
  timeSlot: row.time_slot,
  createdAt: new Date(row.created_at),
  updatedAt: new Date(row.updated_at),
});

// Transform Customer to database format
const transformToDbCustomer = (customer: Partial<Customer>) => {
  const nameParts = customer.name?.split(' ') || ['', ''];
  const firstName = customer.firstName || nameParts[0] || '';
  const lastName = customer.lastName || nameParts.slice(1).join(' ') || '';
  
  return {
    first_name: firstName,
    last_name: lastName,
    phone: customer.phone || null,
    email: customer.email || null,
    notes: customer.notes || null,
    address: customer.address || null,
    gender: customer.gender || null,
    birth_date: customer.birthDate ? new Date(customer.birthDate).toISOString().split('T')[0] : null,
    total_debt: customer.totalDebt || 0,
    is_active: customer.isActive ?? true,
    membership_package_id: customer.membershipPackageId ? String(customer.membershipPackageId) : null,
    membership_start_date: customer.membershipStartDate ? new Date(customer.membershipStartDate).toISOString().split('T')[0] : null,
    membership_end_date: customer.membershipEndDate ? new Date(customer.membershipEndDate).toISOString().split('T')[0] : null,
    group_number: customer.groupNumber || null,
    time_slot: customer.timeSlot || null,
  };
};

export const getCustomers = async (): Promise<Customer[]> => {
  try {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []).map(transformDbCustomer);
  } catch (err) {
    console.error('Error fetching customers from server:', err);
    return [];
  }
};

export const setCustomers = async (customers: Customer[]): Promise<void> => {
  console.warn('setCustomers is deprecated, use individual CRUD operations');
};

export const addCustomer = async (customer: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>): Promise<Customer | null> => {
  if (!(await ensureWriteAllowed())) {
    console.warn('Write blocked: write access not allowed in current configuration');
    return null;
  }
  const dbCustomer = transformToDbCustomer(customer);
  try {
    const { data, error } = await supabase
      .from('customers')
      .insert(dbCustomer)
      .select()
      .single();

    if (error) throw error;
    return transformDbCustomer(data);
  } catch (err) {
    console.error('Error adding customer:', err);
    return null;
  }
};

export const updateCustomer = async (id: string | number, updates: Partial<Customer>): Promise<boolean> => {
  if (!(await ensureWriteAllowed())) {
    console.warn('Write blocked: write access not allowed in current configuration');
    return false;
  }
  const dbUpdates = transformToDbCustomer(updates);
  
  const { error } = await supabase
    .from('customers')
    .update(dbUpdates)
    .eq('id', String(id));
  
  if (error) {
    console.error('Error updating customer:', error);
    return false;
  }
  
  return true;
};

export const deleteCustomer = async (id: string | number): Promise<boolean> => {
  if (!(await ensureWriteAllowed())) {
    console.warn('Write blocked: write access not allowed in current configuration');
    return false;
  }

  const { error } = await supabase
    .from('customers')
    .delete()
    .eq('id', String(id));
  
  if (error) {
    console.error('Error deleting customer:', error);
    return false;
  }
  
  return true;
};

// Customer Records - stored in memory for now, can be migrated to Supabase later
let customerRecords: CustomerRecord[] = [];

export const getCustomerRecords = async (): Promise<CustomerRecord[]> => {
  return customerRecords;
};

export const setCustomerRecords = async (records: CustomerRecord[]): Promise<void> => {
  customerRecords = records;
};

export const addCustomerRecord = async (record: Omit<CustomerRecord, 'id' | 'createdAt'> & { date?: Date }): Promise<CustomerRecord | null> => {
  if (!(await ensureWriteAllowed())) {
    console.warn('Write blocked: write access not allowed in current configuration');
    return null;
  }

  try {
    const localId = `record-${Date.now()}`;
    const newRecord: CustomerRecord = {
      id: localId,
      customerId: record.customerId,
      customerName: record.customerName,
      type: record.type || 'debt',
      itemId: (record as any).itemId ?? null,
      itemName: record.itemName || '',
      amount: record.amount || 0,
      date: record.date || new Date(),
      dueDate: record.dueDate,
      isPaid: record.isPaid,
      description: record.description,
      recordType: record.recordType || 'debt',
      paymentMethod: record.paymentMethod,
      discount: record.discount,
      quantity: record.quantity,
      staffId: record.staffId,
      staffName: record.staffName,
      commissionAmount: record.commissionAmount,
    } as CustomerRecord;

    customerRecords = [...customerRecords, newRecord];
    return newRecord;
  } catch (err) {
    console.error('Error adding customer record:', err);
    return null;
  }
};
