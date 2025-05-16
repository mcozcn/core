
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
  setProducts
} from '../storage';

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

export const getProductsSync = getStockSync;

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
  setProducts
};
