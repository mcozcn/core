
import { getFromStorage, setToStorage } from './core';
import { STORAGE_KEYS } from './storageKeys';
import type { Customer, CustomerRecord } from './types';

export const getCustomers = async (): Promise<Customer[]> => {
  const result = await getFromStorage<Customer[]>(STORAGE_KEYS.CUSTOMERS);
  return Array.isArray(result) ? result : [];
};

export const setCustomers = async (customers: Customer[]): Promise<void> => {
  await setToStorage(STORAGE_KEYS.CUSTOMERS, customers);
};

export const getCustomerRecords = async (): Promise<CustomerRecord[]> => {
  const result = await getFromStorage<CustomerRecord[]>(STORAGE_KEYS.CUSTOMER_RECORDS);
  return Array.isArray(result) ? result : [];
};

export const setCustomerRecords = async (records: CustomerRecord[]): Promise<void> => {
  await setToStorage(STORAGE_KEYS.CUSTOMER_RECORDS, records);
};
