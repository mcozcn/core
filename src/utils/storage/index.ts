
export { type Appointment, type Customer, type CustomerRecord, type Service, 
  type ServiceSale, type StockItem, type Sale, type Cost, 
  type Payment, type User, type StaffPerformance } from './types';

// Export these types explicitly 
export type { StockMovement, UserPerformance, UserActivity } from './types';

// Export personnel types
export type { Personnel, PersonnelRecord } from './personnel';

// Export fitness types
export type { MembershipPackage, MemberSubscription } from './membershipPackages';
export type { CheckInRecord } from './checkIn';
export type { BodyMetric } from './bodyMetrics';

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
export * from './personnel';
export * from './membershipPackages';
export * from './checkIn';
export * from './bodyMetrics';
export * from '../whatsapp';
