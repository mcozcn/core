import { 
  getAppointments, 
  setAppointments, 
  getCustomers,
  setCustomers,
  getCustomerRecords,
  setCustomerRecords,
  getServices,
  setServices,
  getServiceSales,
  setServiceSales,
  getStock,
  setStock,
  getSales,
  setSales,
  getProducts,
  setProducts,
  getCosts,
  setCosts,
  getPayments,
  setPayments,
  getUsers,
  setUsers,
  getStaff,
  getStockMovements,
  setStockMovements,
  addStockMovement,
  StockMovement
} from '../storage';

// Re-export the types
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
  StockMovement
} from '../storage/types';

// This file provides synchronous interfaces for components that haven't been updated to use async/await
// It immediately resolves promises to maintain compatibility

export const getAppointmentsSync = () => {
  const result: any = [];
  getAppointments().then(data => {
    result.push(...data);
  });
  return result;
};

export const getCustomersSync = () => {
  const result: any = [];
  getCustomers().then(data => {
    result.push(...data);
  });
  return result;
};

export const getCustomerRecordsSync = () => {
  const result: any = [];
  getCustomerRecords().then(data => {
    result.push(...data);
  });
  return result;
};

export const getServicesSync = () => {
  const result: any = [];
  getServices().then(data => {
    result.push(...data);
  });
  return result;
};

export const getServiceSalesSync = () => {
  const result: any = [];
  getServiceSales().then(data => {
    result.push(...data);
  });
  return result;
};

export const getStockSync = () => {
  const result: any = [];
  getStock().then(data => {
    result.push(...data);
  });
  return result;
};

export const getSalesSync = () => {
  const result: any = [];
  getSales().then(data => {
    result.push(...data);
  });
  return result;
};

export const getCostsSync = () => {
  const result: any = [];
  getCosts().then(data => {
    result.push(...data);
  });
  return result;
};

export const getPaymentsSync = () => {
  const result: any = [];
  getPayments().then(data => {
    result.push(...data);
  });
  return result;
};

export const getUsersSync = () => {
  const result: any = [];
  getUsers().then(data => {
    result.push(...data);
  });
  return result;
};

export const getStaffSync = () => {
  const result: any = [];
  getStaff().then(data => {
    result.push(...data);
  });
  return result;
};

export const getProductsSync = getStockSync;

export const getStockMovementsSync = () => {
  const result: any = [];
  getStockMovements().then(data => {
    result.push(...data);
  });
  return result;
};

// Export both the async and sync versions
export {
  getAppointments,
  setAppointments,
  getCustomers,
  setCustomers,
  getCustomerRecords,
  setCustomerRecords,
  getServices,
  setServices,
  getServiceSales,
  setServiceSales,
  getStock,
  setStock,
  getSales,
  setSales,
  getProducts,
  setProducts,
  getCosts,
  setCosts,
  getPayments,
  setPayments,
  getUsers,
  setUsers,
  getStaff,
  getStockMovements,
  setStockMovements,
  addStockMovement
};
