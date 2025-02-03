import { getFromStorage, setToStorage } from './core';
import { STORAGE_KEYS } from './storageKeys';
import type { Customer, CustomerRecord } from './types';

export const getCustomers = (): Customer[] =>
  getFromStorage<Customer>(STORAGE_KEYS.CUSTOMERS);

export const setCustomers = (customers: Customer[]): void =>
  setToStorage(STORAGE_KEYS.CUSTOMERS, customers);

export const getCustomerRecords = (): CustomerRecord[] =>
  getFromStorage<CustomerRecord>(STORAGE_KEYS.CUSTOMER_RECORDS);

export const setCustomerRecords = (records: CustomerRecord[]): void =>
  setToStorage(STORAGE_KEYS.CUSTOMER_RECORDS, records);