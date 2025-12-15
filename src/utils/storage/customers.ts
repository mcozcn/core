import { supabase } from "@/integrations/supabase/client";
import { ensureWriteAllowed } from '@/utils/guestGuard';
import { getFromStorage, setToStorage } from './core';
import { STORAGE_KEYS } from './storageKeys';
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
  // Try server first
  let serverCustomers: Customer[] = [];
  try {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    serverCustomers = (data || []).map(transformDbCustomer);
  } catch (err) {
    console.warn('Error fetching customers from server, will merge with local storage:', err);
  }

  // Always read local storage and merge local-only customers into the result
  let localCustomers: Customer[] = [];
  try {
    const local = await getFromStorage<any>(STORAGE_KEYS.CUSTOMERS);
    localCustomers = (local || []).map((row: any) => ({
      id: row.id,
      name: row.name,
      firstName: row.firstName || '',
      lastName: row.lastName || '',
      phone: row.phone || '',
      email: row.email || '',
      address: row.address || '',
      notes: row.notes || '',
      totalDebt: row.totalDebt || 0,
      isActive: row.isActive ?? true,
      membershipPackageId: row.membershipPackageId,
      membershipStartDate: row.membershipStartDate ? new Date(row.membershipStartDate) : undefined,
      membershipEndDate: row.membershipEndDate ? new Date(row.membershipEndDate) : undefined,
      groupNumber: row.groupNumber,
      timeSlot: row.timeSlot,
      createdAt: row.createdAt ? new Date(row.createdAt) : new Date(),
      updatedAt: row.updatedAt ? new Date(row.updatedAt) : new Date(),
    }));
  } catch (e) {
    console.warn('Failed reading local customers:', e);
  }

  const mergedMap = new Map<string, Customer>();
  const put = (c: Customer) => mergedMap.set(String(c.id), c);

  for (const c of serverCustomers) put(c);
  for (const c of localCustomers) {
    if (!mergedMap.has(String(c.id))) put(c);
  }

  return Array.from(mergedMap.values()).sort((a, b) => +new Date(b.createdAt ?? 0) - +new Date(a.createdAt ?? 0));
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
    console.warn('Error adding customer to server, saving locally as fallback:', err);
    try {
      const existing = await getFromStorage<any>(STORAGE_KEYS.CUSTOMERS);
      const localId = `local-${Date.now()}`;
      const localCustomer = {
        id: localId,
        name: customer.name,
        firstName: customer.firstName || '',
        lastName: customer.lastName || '',
        phone: customer.phone || '',
        email: customer.email || '',
        address: customer.address || '',
        notes: customer.notes || '',
        totalDebt: customer.totalDebt || 0,
        isActive: customer.isActive ?? true,
        membershipPackageId: customer.membershipPackageId,
        membershipStartDate: customer.membershipStartDate ? new Date(customer.membershipStartDate) : undefined,
        membershipEndDate: customer.membershipEndDate ? new Date(customer.membershipEndDate) : undefined,
        groupNumber: customer.groupNumber,
        timeSlot: customer.timeSlot,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as Customer;

      await setToStorage(STORAGE_KEYS.CUSTOMERS, [...existing, localCustomer as any]);

      // Also update synchronous localStorage copies for immediate UI consistency
      try {
        const local = await import('@/utils/localStorage');
        const localCustomers = local.getCustomers();
        local.setCustomers([...localCustomers, localCustomer as any]);
      } catch (syncErr) {
        console.warn('Local synchronous save after customer fallback failed:', syncErr);
      }

      return localCustomer;
    } catch (fallbackErr) {
      console.error('Local fallback for adding customer failed:', fallbackErr);
      return null;
    }
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
  
  // Update async/local copies so UI stays in sync
  try {
    const customers = await getCustomers();
    const updatedCustomers = customers.map(c => c.id === id ? { ...c, ...updates } as Customer : c);
    await setToStorage(STORAGE_KEYS.CUSTOMERS, updatedCustomers as any);

    // Also update synchronous localStorage copies
    try {
      const local = await import('@/utils/localStorage');
      const localCustomers = local.getCustomers();
      const newLocalCustomers = localCustomers.map(c => c.id === id ? { ...c, ...updates } as any : c);
      local.setCustomers(newLocalCustomers);
    } catch (err) {
      console.warn('Local sync after update failed:', err);
    }
  } catch (err) {
    console.warn('Async sync after update failed:', err);
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
  
  // Also remove related local-only data (appointments, customerRecords) to keep UI consistent
  try {
    const { getAppointments, setAppointments } = await import('./appointments');
    const { getCustomerRecords, setCustomerRecords } = await import('./customers');

    const appointments = await getAppointments();
    const filteredAppointments = appointments.filter(a => String(a.customerId) !== String(id));
    await setAppointments(filteredAppointments as any);

    const records = await getCustomerRecords();
    const filteredRecords = records.filter(r => String(r.customerId) !== String(id));
    await setCustomerRecords(filteredRecords as any);
    
    // Also update synchronous localStorage copies for immediate UI consistency
    try {
      const local = await import('@/utils/localStorage');
      const localAppointments = local.getAppointments();
      const newLocalAppointments = localAppointments.filter(a => String(a.customerId) !== String(id));
      local.setAppointments(newLocalAppointments);

      const localCustomers = local.getCustomers();
      const newLocalCustomers = localCustomers.filter(c => String(c.id) !== String(id));
      local.setCustomers(newLocalCustomers);

      const localRecords = local.getCustomerRecords();
      const newLocalRecords = localRecords.filter(r => String(r.customerId) !== String(id));
      local.setCustomerRecords(newLocalRecords);
    } catch (err) {
      console.warn('Local synchronous cleanup failed:', err);
    }
  } catch (err) {
    console.warn('Post-delete cleanup failed:', err);
  }

  return true;
};

export const getCustomerRecords = async (): Promise<CustomerRecord[]> => {
  try {
    const result = await getFromStorage<CustomerRecord>(STORAGE_KEYS.CUSTOMER_RECORDS);
    return Array.isArray(result) ? result : [];
  } catch (err) {
    console.error('Error fetching customer records:', err);
    return [];
  }
};

export const setCustomerRecords = async (records: CustomerRecord[]): Promise<void> => {
  try {
    await setToStorage(STORAGE_KEYS.CUSTOMER_RECORDS, records as any);
  } catch (err) {
    console.error('Error setting customer records:', err);
  }
};

export const addCustomerRecord = async (record: Omit<CustomerRecord, 'id' | 'createdAt' | 'date'>): Promise<CustomerRecord | null> => {
  if (!(await ensureWriteAllowed())) {
    console.warn('Write blocked: write access not allowed in current configuration');
    return null;
  }

  try {
    const existing = await getCustomerRecords();
    const localId = `local-${Date.now()}`;
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

    await setCustomerRecords([...existing, newRecord]);

    // Also update synchronous localStorage copies for immediate UI consistency
    try {
      const local = await import('@/utils/localStorage');
      const localRecords = local.getCustomerRecords();
      local.setCustomerRecords([...localRecords, newRecord as any]);
    } catch (syncErr) {
      console.warn('Local synchronous save after adding customer record failed:', syncErr);
    }

    return newRecord;
  } catch (err) {
    console.error('Error adding customer record:', err);
    return null;
  }
};
