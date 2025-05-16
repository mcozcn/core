
import { getFromStorage, setToStorage } from './core';
import { STORAGE_KEYS } from './storageKeys';
import type { Payment } from './types';

export const getPayments = async (): Promise<Payment[]> => {
  const result = await getFromStorage<Payment[]>(STORAGE_KEYS.PAYMENTS);
  return result || [];
};

export const setPayments = async (payments: Payment[]): Promise<void> => {
  await setToStorage(STORAGE_KEYS.PAYMENTS, payments);
};
