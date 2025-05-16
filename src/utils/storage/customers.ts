
import { getFromStorage, setToStorage } from './core';
import { STORAGE_KEYS } from './storageKeys';
import type { Customer, CustomerRecord } from './types';

export const getCustomers = async (): Promise<Customer[]> =>
  await getFromStorage<Customer[]>(STORAGE_KEYS.CUSTOMERS) || [];

export const setCustomers = async (customers: Customer[]): Promise<void> =>
  await setToStorage(STORAGE_KEYS.CUSTOMERS, customers);

export const getCustomerRecords = async (): Promise<CustomerRecord[]> =>
  await getFromStorage<CustomerRecord[]>(STORAGE_KEYS.CUSTOMER_RECORDS) || [];

export const setCustomerRecords = async (records: CustomerRecord[]): Promise<void> =>
  await setToStorage(STORAGE_KEYS.CUSTOMER_RECORDS, records);
