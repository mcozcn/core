
import { getFromStorage, setToStorage } from './core';
import { STORAGE_KEYS } from './storageKeys';
import type { Service, ServiceSale } from './types';

export const getServices = async (): Promise<Service[]> => {
  const result = await getFromStorage<Service>(STORAGE_KEYS.SERVICES);
  return result as Service[];
};

export const setServices = async (services: Service[]): Promise<void> => {
  await setToStorage(STORAGE_KEYS.SERVICES, services);
};

export const getServiceSales = async (): Promise<ServiceSale[]> => {
  const result = await getFromStorage<ServiceSale>(STORAGE_KEYS.SERVICE_SALES);
  return result as ServiceSale[];
};

export const setServiceSales = async (sales: ServiceSale[]): Promise<void> => {
  await setToStorage(STORAGE_KEYS.SERVICE_SALES, sales);
};
