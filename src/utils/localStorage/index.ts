import {
  getAppointments as getAppointmentsAsync,
  setAppointments as setAppointmentsAsync
} from '../storage/appointments';

import {
  getCustomers as getCustomersAsync,
  setCustomers as setCustomersAsync,
  getCustomerRecords as getCustomerRecordsAsync,
  setCustomerRecords as setCustomerRecordsAsync
} from '../storage/customers';

import {
  getServices as getServicesAsync,
  setServices as setServicesAsync,
  getServiceSales as getServiceSalesAsync,
  setServiceSales as setServiceSalesAsync
} from '../storage/services';

import {
  getStock as getStockAsync,
  setStock as setStockAsync,
  getSales as getSalesAsync,
  setSales as setSalesAsync
} from '../storage/stock';

import {
  getCosts as getCostsAsync,
  setCosts as setCostsAsync
} from '../storage/costs';

import {
  getPayments as getPaymentsAsync,
  setPayments as setPaymentsAsync
} from '../storage/payments';

import {
  getUsers as getUsersAsync,
  setUsers as setUsersAsync,
  getCurrentUser as getCurrentUserAsync,
  setCurrentUser as setCurrentUserAsync
} from '../storage/users';

import {
  getUserPerformance as getUserPerformanceAsync,
  setUserPerformance as setUserPerformanceAsync,
  getUserActivities as getUserActivitiesAsync,
  setUserActivities as setUserActivitiesAsync,
  addUserActivity as addUserActivityAsync
} from '../storage/userPerformance';

import {
  getStockMovements as getStockMovementsAsync,
  setStockMovements as setStockMovementsAsync,
  addStockMovement as addStockMovementAsync
} from '../storage/stockMovements';

import type {
  Appointment,
  Customer,
  CustomerRecord,
  Service,
  ServiceSale,
  StockItem,
  Sale,
  Cost,
  Payment,
  User,
  UserPerformance,
  UserActivity,
  StockMovement
} from '../storage/types';

// Synchronous versions
export const getAppointments = (): Appointment[] => {
  let result: Appointment[] = [];
  try {
    result = JSON.parse(localStorage.getItem('appointments') || '[]');
  } catch (e) {
    console.error('Error loading appointments:', e);
  }
  return result;
};

export const setAppointments = (appointments: Appointment[]): void => {
  try {
    localStorage.setItem('appointments', JSON.stringify(appointments));
    // Don't await the promise, just call it
    setAppointmentsAsync(appointments);
  } catch (e) {
    console.error('Error saving appointments:', e);
  }
};

export const getCustomers = (): Customer[] => {
  let result: Customer[] = [];
  try {
    result = JSON.parse(localStorage.getItem('customers') || '[]');
  } catch (e) {
    console.error('Error loading customers:', e);
  }
  return result;
};

export const setCustomers = (customers: Customer[]): void => {
  try {
    localStorage.setItem('customers', JSON.stringify(customers));
  
    // Don't await the promise, just call it
    setCustomersAsync(customers);
  } catch (e) {
    console.error('Error saving customers:', e);
  }
};

export const getCustomerRecords = (): CustomerRecord[] => {
  let result: CustomerRecord[] = [];
  try {
    result = JSON.parse(localStorage.getItem('customerRecords') || '[]');
  } catch (e) {
    console.error('Error loading customer records:', e);
  }
  return result;
};

export const setCustomerRecords = (records: CustomerRecord[]): void => {
  try {
    localStorage.setItem('customerRecords', JSON.stringify(records));
  
    // Don't await the promise, just call it
    setCustomerRecordsAsync(records);
  } catch (e) {
    console.error('Error saving customer records:', e);
  }
};

export const getServices = (): Service[] => {
  let result: Service[] = [];
  try {
    result = JSON.parse(localStorage.getItem('services') || '[]');
  } catch (e) {
    console.error('Error loading services:', e);
  }
  return result;
};

export const setServices = (services: Service[]): void => {
  try {
    localStorage.setItem('services', JSON.stringify(services));
  
    // Don't await the promise, just call it
    setServicesAsync(services);
  } catch (e) {
    console.error('Error saving services:', e);
  }
};

export const getProducts = (): StockItem[] => {
  let result: StockItem[] = [];
  try {
    result = JSON.parse(localStorage.getItem('stock') || '[]');
  } catch (e) {
    console.error('Error loading products:', e);
  }
  return result;
};

export const setProducts = (products: StockItem[]): void => {
  try {
    localStorage.setItem('stock', JSON.stringify(products));
  
    // Don't await the promise, just call it
    setStockAsync(products);
  } catch (e) {
    console.error('Error saving products:', e);
  }
};

export const getCosts = (): Cost[] => {
  let result: Cost[] = [];
  try {
    result = JSON.parse(localStorage.getItem('costs') || '[]');
  } catch (e) {
    console.error('Error loading costs:', e);
  }
  return result;
};

export const setCosts = (costs: Cost[]): void => {
  try {
    localStorage.setItem('costs', JSON.stringify(costs));
  
    // Don't await the promise, just call it
    setCostsAsync(costs);
  } catch (e) {
    console.error('Error saving costs:', e);
  }
};

export const getPayments = (): Payment[] => {
  let result: Payment[] = [];
  try {
    result = JSON.parse(localStorage.getItem('payments') || '[]');
  } catch (e) {
    console.error('Error loading payments:', e);
  }
  return result;
};

export const setPayments = (payments: Payment[]): void => {
  try {
    localStorage.setItem('payments', JSON.stringify(payments));
  
    // Don't await the promise, just call it
    setPaymentsAsync(payments);
  } catch (e) {
    console.error('Error saving payments:', e);
  }
};

export const getCurrentUser = (): User | null => {
  let result: User | null = null;
  try {
    const stored = localStorage.getItem('currentUser');
    result = stored ? JSON.parse(stored) : null;
  } catch (e) {
    console.error('Error loading current user:', e);
  }
  return result;
};

export const setCurrentUser = (user: User | null): void => {
  try {
    if (user) {
      localStorage.setItem('currentUser', JSON.stringify(user));
    } else {
      localStorage.removeItem('currentUser');
    }
    
    // Don't await the promise, just call it
    setCurrentUserAsync(user);
  } catch (e) {
    console.error('Error saving current user:', e);
  }
};

export const getUsers = (): User[] => {
  let result: User[] = [];
  try {
    result = JSON.parse(localStorage.getItem('users') || '[]');
  } catch (e) {
    console.error('Error loading users:', e);
  }
  return result;
};

export const setUsers = (users: User[]): void => {
  try {
    localStorage.setItem('users', JSON.stringify(users));
    
    // Don't await the promise, just call it
    setUsersAsync(users);
  } catch (e) {
    console.error('Error saving users:', e);
  }
};

export const getUserPerformance = (): UserPerformance[] => {
  let result: UserPerformance[] = [];
  try {
    result = JSON.parse(localStorage.getItem('userPerformance') || '[]');
  } catch (e) {
    console.error('Error loading user performance:', e);
  }
  return result;
};

export const setUserPerformance = (performance: UserPerformance[]): void => {
  try {
    localStorage.setItem('userPerformance', JSON.stringify(performance));
  
    // Don't await the promise, just call it
    setUserPerformanceAsync(performance);
  } catch (e) {
    console.error('Error saving user performance:', e);
  }
};

export const getUserActivities = (): UserActivity[] => {
  let result: UserActivity[] = [];
  try {
    result = JSON.parse(localStorage.getItem('userActivities') || '[]');
  } catch (e) {
    console.error('Error loading user activities:', e);
  }
  return result;
};

export const setUserActivities = (activities: UserActivity[]): void => {
  try {
    localStorage.setItem('userActivities', JSON.stringify(activities));
  
    // Don't await the promise, just call it
    setUserActivitiesAsync(activities);
  } catch (e) {
    console.error('Error saving user activities:', e);
  }
};

export const addUserActivity = (activity: Omit<UserActivity, 'id' | 'timestamp'>): void => {
  const activities = getUserActivities();
  const newActivity: UserActivity = {
    ...activity,
    id: Date.now(),
    timestamp: new Date() // Fix: Use Date object instead of string
  };
  setUserActivities([...activities, newActivity]);
  
  // Also update async storage
  addUserActivityAsync(activity).catch(console.error);
};

export const getStockMovements = (): StockMovement[] => {
  let result: StockMovement[] = [];
  try {
    result = JSON.parse(localStorage.getItem('stockMovements') || '[]');
  } catch (e) {
    console.error('Error loading stock movements:', e);
  }
  return result;
};

export const setStockMovements = (movements: StockMovement[]): void => {
  try {
    localStorage.setItem('stockMovements', JSON.stringify(movements));
  
    // Also update async storage
    setStockMovementsAsync(movements).catch(console.error);
  } catch (e) {
    console.error('Error saving stock movements:', e);
  }
};

export const addStockMovement = (movement: Omit<StockMovement, 'id'>): StockMovement => {
  const movements = getStockMovements();
  const newMovement: StockMovement = {
    ...movement,
    id: Date.now()
  };
  setStockMovements([...movements, newMovement]);
  
  // Also update async storage (don't wait for it)
  addStockMovementAsync(movement).catch(console.error);
  
  return newMovement;
};

// Add missing functions for Sales and ServiceSales
export const getSales = (): Sale[] => {
  let result: Sale[] = [];
  try {
    result = JSON.parse(localStorage.getItem('sales') || '[]');
  } catch (e) {
    console.error('Error loading sales:', e);
  }
  return result;
};

export const setSales = (sales: Sale[]): void => {
  try {
    localStorage.setItem('sales', JSON.stringify(sales));
    
    // Don't await the promise, just call it
    setSalesAsync(sales);
  } catch (e) {
    console.error('Error saving sales:', e);
  }
};

export const getStock = getProducts;
export const setStock = setProducts;

export const getServiceSales = (): ServiceSale[] => {
  let result: ServiceSale[] = [];
  try {
    result = JSON.parse(localStorage.getItem('serviceSales') || '[]');
  } catch (e) {
    console.error('Error loading service sales:', e);
  }
  return result;
};

export const setServiceSales = (sales: ServiceSale[]): void => {
  try {
    localStorage.setItem('serviceSales', JSON.stringify(sales));
    
    // Don't await the promise, just call it
    setServiceSalesAsync(sales);
  } catch (e) {
    console.error('Error saving service sales:', e);
  }
};

// Export types
export type { 
  Appointment,
  Customer,
  CustomerRecord,
  Service,
  ServiceSale,
  StockItem,
  Sale,
  Cost,
  Payment,
  User,
  UserPerformance,
  UserActivity,
  StockMovement
};
