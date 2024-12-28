// Local storage keys
const STORAGE_KEYS = {
  APPOINTMENTS: 'appointments',
  CUSTOMERS: 'customers',
  SERVICES: 'services',
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