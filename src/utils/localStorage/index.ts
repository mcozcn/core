
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
  UserActivity,
  StockMovement
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

// Appointments - Using async/await pattern
export const getAppointments = async (): Promise<Appointment[]> => await getFromStorage<Appointment>(STORAGE_KEYS.APPOINTMENTS);
export const setAppointments = async (appointments: Appointment[]): Promise<void> => await setToStorage(STORAGE_KEYS.APPOINTMENTS, appointments);

// Customers
export const getCustomers = async (): Promise<Customer[]> => await getFromStorage<Customer>(STORAGE_KEYS.CUSTOMERS);
export const setCustomers = async (customers: Customer[]): Promise<void> => await setToStorage(STORAGE_KEYS.CUSTOMERS, customers);

// Services
export const getServices = async (): Promise<Service[]> => await getFromStorage<Service>(STORAGE_KEYS.SERVICES);
export const setServices = async (services: Service[]): Promise<void> => await setToStorage(STORAGE_KEYS.SERVICES, services);

// Stock/Products
export const getStock = async (): Promise<StockItem[]> => await getFromStorage<StockItem>(STORAGE_KEYS.STOCK);
export const setStock = async (stock: StockItem[]): Promise<void> => await setToStorage(STORAGE_KEYS.STOCK, stock);
export const getProducts = async (): Promise<StockItem[]> => await getStock();

// Stock Movements
export const getStockMovements = async (): Promise<StockMovement[]> => await getFromStorage<StockMovement>(STORAGE_KEYS.STOCK_MOVEMENTS);
export const setStockMovements = async (movements: StockMovement[]): Promise<void> => await setToStorage(STORAGE_KEYS.STOCK_MOVEMENTS, movements);

export const addStockMovement = async (movement: Omit<StockMovement, 'id' | 'createdAt'>): Promise<StockMovement> => {
  const movements = await getStockMovements();
  const newMovement: StockMovement = {
    ...movement,
    id: Date.now(),
    createdAt: new Date()
  };
  
  const stock = await getStock();
  const product = stock.find(item => item.productId === movement.productId);
  
  if (!product) {
    throw new Error('Ürün bulunamadı');
  }

  // Stok miktarını güncelle
  const updatedStock = stock.map(item => {
    if (item.productId === movement.productId) {
      const newQuantity = movement.type === 'in' 
        ? item.quantity + movement.quantity 
        : item.quantity - movement.quantity;
      
      // Ortalama maliyet hesaplama (sadece giriş hareketlerinde)
      const newCost = movement.type === 'in'
        ? ((item.quantity * item.cost) + (movement.quantity * movement.cost)) / (item.quantity + movement.quantity)
        : item.cost;

      return {
        ...item,
        quantity: newQuantity,
        cost: newCost,
        lastUpdated: new Date()
      };
    }
    return item;
  });

  await setStock(updatedStock);
  await setStockMovements([...movements, newMovement]);

  return newMovement;
};

// Sales
export const getSales = async (): Promise<Sale[]> => await getFromStorage<Sale>(STORAGE_KEYS.SALES);
export const setSales = async (sales: Sale[]): Promise<void> => await setToStorage(STORAGE_KEYS.SALES, sales);

// Service Sales
export const getServiceSales = async (): Promise<ServiceSale[]> => await getFromStorage<ServiceSale>(STORAGE_KEYS.SERVICE_SALES);
export const setServiceSales = async (sales: ServiceSale[]): Promise<void> => await setToStorage(STORAGE_KEYS.SERVICE_SALES, sales);

// Customer Records
export const getCustomerRecords = async (): Promise<CustomerRecord[]> => await getFromStorage<CustomerRecord>(STORAGE_KEYS.CUSTOMER_RECORDS);
export const setCustomerRecords = async (records: CustomerRecord[]): Promise<void> => await setToStorage(STORAGE_KEYS.CUSTOMER_RECORDS, records);

// Payments
export const getPayments = async (): Promise<Payment[]> => await getFromStorage<Payment>(STORAGE_KEYS.PAYMENTS);
export const setPayments = async (payments: Payment[]): Promise<void> => await setToStorage(STORAGE_KEYS.PAYMENTS, payments);

// Costs
export const getCosts = async (): Promise<Cost[]> => await getFromStorage<Cost>(STORAGE_KEYS.COSTS);
export const setCosts = async (costs: Cost[]): Promise<void> => await setToStorage(STORAGE_KEYS.COSTS, costs);

// Users
export const getUsers = async (): Promise<User[]> => await getFromStorage<User>(STORAGE_KEYS.USERS);
export const setUsers = async (users: User[]): Promise<void> => await setToStorage(STORAGE_KEYS.USERS, users);

// User Performance
export const getUserPerformance = async (): Promise<UserPerformance[]> => await getFromStorage<UserPerformance>(STORAGE_KEYS.USER_PERFORMANCE);
export const setUserPerformance = async (performance: UserPerformance[]): Promise<void> => await setToStorage(STORAGE_KEYS.USER_PERFORMANCE, performance);

// User Activities
export const getUserActivities = async (): Promise<UserActivity[]> => await getFromStorage<UserActivity>(STORAGE_KEYS.USER_ACTIVITIES);
export const setUserActivities = async (activities: UserActivity[]): Promise<void> => await setToStorage(STORAGE_KEYS.USER_ACTIVITIES, activities);

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
  UserActivity,
  StockMovement
};
