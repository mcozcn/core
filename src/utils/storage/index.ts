
export { type Appointment, type Customer, type CustomerRecord, type Service, 
  type ServiceSale, type StockItem, type Sale, type Cost, 
  type Payment, type User, type StaffPerformance } from './types';

// We need to export the following explicitly to avoid ambiguity
export type { StockMovement, UserPerformance, UserActivity } from './types';

export * from './appointments';
export * from './customers';
export * from './services';
export * from './stock';
export * from './costs';
export * from './payments';
export * from './users';
export * from './staff';
export * from './stockMovements';
export * from './userPerformance';
export * from '../whatsapp';
