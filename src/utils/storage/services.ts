
import { getFromStorage, setToStorage } from './core';
import { STORAGE_KEYS } from './storageKeys';
import type { Service, ServiceSale } from './types';

export const getServices = async (): Promise<Service[]> =>
  await getFromStorage<Service[]>(STORAGE_KEYS.SERVICES) || [];

export const setServices = async (services: Service[]): Promise<void> =>
  await setToStorage(STORAGE_KEYS.SERVICES, services);

export const getServiceSales = async (): Promise<ServiceSale[]> =>
  await getFromStorage<ServiceSale[]>(STORAGE_KEYS.SERVICE_SALES) || [];

export const setServiceSales = async (sales: ServiceSale[]): Promise<void> =>
  await setToStorage(STORAGE_KEYS.SERVICE_SALES, sales);
