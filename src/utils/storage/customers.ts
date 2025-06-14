
import { getFromStorage, setToStorage } from './core';
import { STORAGE_KEYS } from './storageKeys';
import type { Customer, CustomerRecord } from './types';

export const getCustomers = async (): Promise<Customer[]> => {
  const result = await getFromStorage<Customer>(STORAGE_KEYS.CUSTOMERS);
  return result as Customer[];
};

export const setCustomers = async (customers: Customer[]): Promise<void> => {
  await setToStorage(STORAGE_KEYS.CUSTOMERS, customers);
};

export const getCustomerRecords = async (): Promise<CustomerRecord[]> => {
  const result = await getFromStorage<CustomerRecord>(STORAGE_KEYS.CUSTOMER_RECORDS);
  return result as CustomerRecord[];
};

export const setCustomerRecords = async (records: CustomerRecord[]): Promise<void> => {
  // Vadeli ödeme tahsilatı işleminde kayıtları düzgün güncelle
  const processedRecords = records.map(record => {
    // Vadeli ödeme tahsilatı sonrası vadeli ödeme kaydını güncelle
    if (record.recordType === 'installment' && record.isPaid) {
      return {
        ...record,
        isPaid: true
      };
    }
    return record;
  });
  
  await setToStorage(STORAGE_KEYS.CUSTOMER_RECORDS, processedRecords);
};
