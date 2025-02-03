import { getFromStorage, setToStorage } from './core';
import { STORAGE_KEYS } from './storageKeys';
import type { Payment } from './types';

export const getPayments = (): Payment[] =>
  getFromStorage<Payment>(STORAGE_KEYS.PAYMENTS);

export const setPayments = (payments: Payment[]): void =>
  setToStorage(STORAGE_KEYS.PAYMENTS, payments);