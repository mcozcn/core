import { getFromStorage, setToStorage } from './core';
import { STORAGE_KEYS } from './storageKeys';
import type { Service, ServiceSale } from './types';

export const getServices = (): Service[] =>
  getFromStorage<Service>(STORAGE_KEYS.SERVICES);

export const setServices = (services: Service[]): void =>
  setToStorage(STORAGE_KEYS.SERVICES, services);

export const getServiceSales = (): ServiceSale[] =>
  getFromStorage<ServiceSale>(STORAGE_KEYS.SERVICE_SALES);

export const setServiceSales = (sales: ServiceSale[]): void =>
  setToStorage(STORAGE_KEYS.SERVICE_SALES, sales);