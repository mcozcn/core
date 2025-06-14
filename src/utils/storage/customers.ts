
import { getFromStorage, setToStorage } from './core';
import { STORAGE_KEYS } from './storageKeys';
import type { Customer, CustomerRecord } from './types';

// Re-export the Customer type from types.ts
export type { Customer, CustomerRecord } from './types';

// Get customers from storage
export const getCustomers = async (): Promise<Customer[]> => {
  try {
    const customers = await getFromStorage<Customer>(STORAGE_KEYS.CUSTOMERS);
    return customers;
  } catch (error) {
    console.error('Error getting customers:', error);
    return [];
  }
};

// Store customers
export const setCustomers = async (customers: Customer[]): Promise<void> => {
  await setToStorage(STORAGE_KEYS.CUSTOMERS, customers);
};

// Add a new customer
export const addCustomer = async (customerData: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>): Promise<Customer> => {
  const customers = await getCustomers();
  const newCustomer: Customer = {
    ...customerData,
    id: Date.now(),
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  console.log('Adding new customer:', newCustomer);
  await setCustomers([...customers, newCustomer]);
  return newCustomer;
};

// Update customer
export const updateCustomer = async (id: number, updates: Partial<Customer>): Promise<boolean> => {
  try {
    const customers = await getCustomers();
    const customerIndex = customers.findIndex(c => c.id === id);
    
    if (customerIndex === -1) return false;
    
    customers[customerIndex] = {
      ...customers[customerIndex],
      ...updates,
      updatedAt: new Date()
    };
    
    await setCustomers(customers);
    return true;
  } catch (error) {
    console.error('Error updating customer:', error);
    return false;
  }
};

// Delete customer
export const deleteCustomer = async (id: number): Promise<boolean> => {
  try {
    const customers = await getCustomers();
    const filteredCustomers = customers.filter(customer => customer.id !== id);
    await setCustomers(filteredCustomers);
    
    // Also delete customer records
    const customerRecords = await getCustomerRecords();
    const filteredRecords = customerRecords.filter(record => record.customerId !== id);
    await setCustomerRecords(filteredRecords);
    
    return true;
  } catch (error) {
    console.error('Error deleting customer:', error);
    return false;
  }
};

// Get customer records from storage
export const getCustomerRecords = async (): Promise<CustomerRecord[]> => {
  try {
    const records = await getFromStorage<CustomerRecord>(STORAGE_KEYS.CUSTOMER_RECORDS);
    return records;
  } catch (error) {
    console.error('Error getting customer records:', error);
    return [];
  }
};

// Store customer records
export const setCustomerRecords = async (records: CustomerRecord[]): Promise<void> => {
  await setToStorage(STORAGE_KEYS.CUSTOMER_RECORDS, records);
};

// Add a customer record
export const addCustomerRecord = async (record: Omit<CustomerRecord, 'id' | 'createdAt'>): Promise<CustomerRecord> => {
  const records = await getCustomerRecords();
  const newRecord: CustomerRecord = {
    ...record,
    id: Date.now(),
    createdAt: new Date()
  };
  
  console.log('Adding new customer record:', newRecord);
  await setCustomerRecords([...records, newRecord]);
  return newRecord;
};

// Delete customer record
export const deleteCustomerRecord = async (id: number): Promise<boolean> => {
  try {
    const records = await getCustomerRecords();
    const filteredRecords = records.filter(record => record.id !== id);
    await setCustomerRecords(filteredRecords);
    return true;
  } catch (error) {
    console.error('Error deleting customer record:', error);
    return false;
  }
};

// Update customer record
export const updateCustomerRecord = async (id: number, updates: Partial<CustomerRecord>): Promise<boolean> => {
  try {
    const records = await getCustomerRecords();
    const recordIndex = records.findIndex(r => r.id === id);
    
    if (recordIndex === -1) return false;
    
    records[recordIndex] = {
      ...records[recordIndex],
      ...updates
    };
    
    await setCustomerRecords(records);
    return true;
  } catch (error) {
    console.error('Error updating customer record:', error);
    return false;
  }
};
