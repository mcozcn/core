import { getFromStorage, setToStorage } from '../storage/core';
import { STORAGE_KEYS } from '../storage/storageKeys';
import type {
  Appointment,
  Customer,
  Service,
  StockItem,
  Sale,
  ServiceSale,
  CustomerRecord,
  Payment,
  Cost,
  User,
  UserPerformance,
  UserActivity
} from '../storage/types';

// Current User
export const getCurrentUser = (): User | null => {
  const data = localStorage.getItem('currentUser');
  return data ? JSON.parse(data) : null;
};

export const setCurrentUser = (user: User | null) => {
  if (user) {
    localStorage.setItem('currentUser', JSON.stringify(user));
  } else {
    localStorage.removeItem('currentUser');
  }
};

// Appointments
export const getAppointments = (): Appointment[] => getFromStorage(STORAGE_KEYS.APPOINTMENTS);
export const setAppointments = (appointments: Appointment[]) => setToStorage(STORAGE_KEYS.APPOINTMENTS, appointments);

// Customers
export const getCustomers = (): Customer[] => getFromStorage(STORAGE_KEYS.CUSTOMERS);
export const setCustomers = (customers: Customer[]) => setToStorage(STORAGE_KEYS.CUSTOMERS, customers);

// Services
export const getServices = (): Service[] => getFromStorage(STORAGE_KEYS.SERVICES);
export const setServices = (services: Service[]) => setToStorage(STORAGE_KEYS.SERVICES, services);

// Stock/Products
export const getStock = (): StockItem[] => getFromStorage(STORAGE_KEYS.STOCK);
export const setStock = (stock: StockItem[]) => setToStorage(STORAGE_KEYS.STOCK, stock);
export const getProducts = (): StockItem[] => getStock(); // Alias for getStock

// Sales
export const getSales = (): Sale[] => getFromStorage(STORAGE_KEYS.SALES);
export const setSales = (sales: Sale[]) => setToStorage(STORAGE_KEYS.SALES, sales);

// Service Sales
export const getServiceSales = (): ServiceSale[] => getFromStorage(STORAGE_KEYS.SERVICE_SALES);
export const setServiceSales = (sales: ServiceSale[]) => setToStorage(STORAGE_KEYS.SERVICE_SALES, sales);

// Customer Records
export const getCustomerRecords = (): CustomerRecord[] => getFromStorage(STORAGE_KEYS.CUSTOMER_RECORDS);
export const setCustomerRecords = (records: CustomerRecord[]) => setToStorage(STORAGE_KEYS.CUSTOMER_RECORDS, records);

// Payments
export const getPayments = (): Payment[] => getFromStorage(STORAGE_KEYS.PAYMENTS);
export const setPayments = (payments: Payment[]) => setToStorage(STORAGE_KEYS.PAYMENTS, payments);

// Costs
export const getCosts = (): Cost[] => getFromStorage(STORAGE_KEYS.COSTS);
export const setCosts = (costs: Cost[]) => setToStorage(STORAGE_KEYS.COSTS, costs);

// Users
export const getUsers = (): User[] => getFromStorage(STORAGE_KEYS.USERS);
export const setUsers = (users: User[]) => setToStorage(STORAGE_KEYS.USERS, users);

// User Performance
export const getUserPerformance = (): UserPerformance[] => getFromStorage(STORAGE_KEYS.USER_PERFORMANCE);
export const setUserPerformance = (performance: UserPerformance[]) => setToStorage(STORAGE_KEYS.USER_PERFORMANCE, performance);

// User Activities
export const getUserActivities = (): UserActivity[] => getFromStorage(STORAGE_KEYS.USER_ACTIVITIES);
export const setUserActivities = (activities: UserActivity[]) => setToStorage(STORAGE_KEYS.USER_ACTIVITIES, activities);

// Types export
export type {
  Appointment,
  Customer,
  Service,
  StockItem,
  Sale,
  ServiceSale,
  CustomerRecord,
  Payment,
  Cost,
  User,
  UserPerformance,
  UserActivity
};