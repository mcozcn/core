
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
  getStockItems as getStockItemsAsync,
  setStockItems as setStockItemsAsync,
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
  } catch (e) {
    console.error('Error saving appointments:', e);
  }
  
  // Also update async storage
  setAppointmentsAsync(appointments).catch(console.error);
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
  } catch (e) {
    console.error('Error saving customers:', e);
  }
  
  // Also update async storage
  setCustomersAsync(customers).catch(console.error);
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
  } catch (e) {
    console.error('Error saving customer records:', e);
  }
  
  // Also update async storage
  setCustomerRecordsAsync(records).catch(console.error);
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
  } catch (e) {
    console.error('Error saving services:', e);
  }
  
  // Also update async storage
  setServicesAsync(services).catch(console.error);
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
  } catch (e) {
    console.error('Error saving products:', e);
  }
  
  // Also update async storage
  setStockItemsAsync(products).catch(console.error);
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
  } catch (e) {
    console.error('Error saving costs:', e);
  }
  
  // Also update async storage
  setCostsAsync(costs).catch(console.error);
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
  } catch (e) {
    console.error('Error saving payments:', e);
  }
  
  // Also update async storage
  setPaymentsAsync(payments).catch(console.error);
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
  } catch (e) {
    console.error('Error saving current user:', e);
  }
  
  // Also update async storage
  setCurrentUserAsync(user).catch(console.error);
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
  } catch (e) {
    console.error('Error saving users:', e);
  }
  
  // Also update async storage
  setUsersAsync(users).catch(console.error);
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
  } catch (e) {
    console.error('Error saving user performance:', e);
  }
  
  // Also update async storage
  setUserPerformanceAsync(performance).catch(console.error);
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
  } catch (e) {
    console.error('Error saving user activities:', e);
  }
  
  // Also update async storage
  setUserActivitiesAsync(activities).catch(console.error);
};

export const addUserActivity = (activity: Omit<UserActivity, 'id' | 'timestamp'>): void => {
  const activities = getUserActivities();
  const newActivity: UserActivity = {
    ...activity,
    id: Date.now(),
    timestamp: new Date().toISOString()
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
  } catch (e) {
    console.error('Error saving stock movements:', e);
  }
  
  // Also update async storage
  setStockMovementsAsync(movements).catch(console.error);
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
  } catch (e) {
    console.error('Error saving sales:', e);
  }
  
  // Also update async storage
  setSalesAsync(sales).catch(console.error);
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
  } catch (e) {
    console.error('Error saving service sales:', e);
  }
  
  // Also update async storage
  setServiceSalesAsync(sales).catch(console.error);
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
