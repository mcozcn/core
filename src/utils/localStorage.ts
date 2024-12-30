const STORAGE_KEYS = {
  APPOINTMENTS: 'appointments',
  CUSTOMERS: 'customers',
  SERVICES: 'services',
  STOCK: 'stock',
  SALES: 'sales',
  SERVICE_SALES: 'serviceSales',
} as const;

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
  price: number;
  description: string;
  duration?: string;
  type: 'recurring' | 'one-time'; // New field
  createdAt: Date;
}

export interface ServiceSale {
  id: number;
  serviceId: number;
  serviceName: string;
  price: number;
  customerName: string;
  customerPhone: string;
  saleDate: Date;
}

export interface StockItem {
  id: number;
  productId: number;
  productName: string;
  quantity: number;
  price: number;
  cost: number;
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
  customerName: string;
  customerPhone: string;
  saleDate: Date;
}

export interface Cost {
  id: number;
  description: string;
  amount: number;
  category: string;
  date: Date;
  createdAt: Date;
}

const getFromStorage = <T>(key: string): T[] => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
};

const setToStorage = <T>(key: string, data: T[]): void => {
  localStorage.setItem(key, JSON.stringify(data));
};

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

export const getServiceSales = (): ServiceSale[] =>
  getFromStorage<ServiceSale>(STORAGE_KEYS.SERVICE_SALES);

export const setServiceSales = (sales: ServiceSale[]): void =>
  setToStorage(STORAGE_KEYS.SERVICE_SALES, sales);

export const getCosts = (): Cost[] =>
  getFromStorage<Cost>('costs');

export const setCosts = (costs: Cost[]): void =>
  setToStorage('costs', costs);
