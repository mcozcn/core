// Local storage keys
const STORAGE_KEYS = {
  APPOINTMENTS: 'appointments',
  CUSTOMERS: 'customers',
  SERVICES: 'services',
  STOCK: 'stock',
  SALES: 'sales',
} as const;

// Type definitions
export interface Appointment {
  id: number;
  customerName: string;
  date: string;
  time: string;
  service: string;
  createdAt: Date;
}

export interface Customer {
  id: number;
  name: string;
  phone: string;
  email: string;
  createdAt: Date;
}

export interface Service {
  id: number;
  name: string;
  type: 'service' | 'product';
  price: number;
  description: string;
  duration?: string;
  bookings?: number;
  createdAt: Date;
}

export interface StockItem {
  id: number;
  productId: number;
  productName: string;
  quantity: number;
  price: number;
  category: string;
  createdAt: Date;
  lastUpdated: Date;
}

export interface Sale {
  id: number;
  productId: number;
  productName: string;
  quantity: number;
  totalPrice: number;
  saleDate: Date;
}

// Generic get function
const getFromStorage = <T>(key: string): T[] => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
};

// Generic set function
const setToStorage = <T>(key: string, data: T[]): void => {
  localStorage.setItem(key, JSON.stringify(data));
};

// Specific functions for each data type
export const getAppointments = (): Appointment[] => 
  getFromStorage<Appointment>(STORAGE_KEYS.APPOINTMENTS);

export const setAppointments = (appointments: Appointment[]): void =>
  setToStorage(STORAGE_KEYS.APPOINTMENTS, appointments);

export const getCustomers = (): Customer[] =>
  getFromStorage<Customer>(STORAGE_KEYS.CUSTOMERS);

export const setCustomers = (customers: Customer[]): void =>
  setToStorage(STORAGE_KEYS.CUSTOMERS, customers);

export const getServices = (): Service[] =>
  getFromStorage<Service>(STORAGE_KEYS.SERVICES);

export const setServices = (services: Service[]): void =>
  setToStorage(STORAGE_KEYS.SERVICES, services);

export const getStock = (): StockItem[] =>
  getFromStorage<StockItem>(STORAGE_KEYS.STOCK);

export const setStock = (stock: StockItem[]): void =>
  setToStorage(STORAGE_KEYS.STOCK, stock);

export const getSales = (): Sale[] =>
  getFromStorage<Sale>(STORAGE_KEYS.SALES);

export const setSales = (sales: Sale[]): void =>
  setToStorage(STORAGE_KEYS.SALES, sales);
