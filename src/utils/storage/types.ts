export interface Appointment {
  id: number;
  customerId: number;
  customerName: string;
  serviceId: number;
  serviceName: string;
  date: Date;
  startTime: string;
  endTime: string;
  price: number;
  notes?: string;
}

export interface Customer {
  id: number;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  notes?: string;
  appointments?: Appointment[];
}

export interface CustomerRecord {
  id: number;
  customerId: number;
  type: 'payment' | 'debt';
  itemId: number;
  itemName: string;
  amount: number;
  date: Date;
  dueDate?: Date;
  isPaid?: boolean;
  description?: string;
  recordType?: 'debt' | 'payment' | 'installment';
}

export interface Service {
  id: number;
  name: string;
  description?: string;
  price: number;
  duration: number;
}

export interface ServiceSale {
  id: number;
  serviceId: number;
  serviceName: string;
  price: number;
  saleDate: Date;
}

export interface StockItem {
  id: number;
  name: string;
  description?: string;
  price: number;
  quantity: number;
  unit: string;
  category: string;
}

export interface StockMovement {
  id: number;
  stockItemId: number;
  stockItemName: string;
  quantityChange: number;
  movementDate: Date;
  type: 'in' | 'out';
  reason?: string;
}

export interface Sale {
  id: number;
  customerId: number;
  customerName: string;
  stockItemId: number;
  stockItemName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  saleDate: Date;
}

export interface Cost {
  id: number;
  name: string;
  description?: string;
  amount: number;
  date: Date;
  category: string;
}

export interface Payment {
  id: number;
  customerId: number;
  customerName: string;
  amount: number;
  date: Date;
  method: string;
}

export interface User {
  id: number;
  username: string;
  password?: string;
  displayName: string;
  role: 'admin' | 'manager' | 'user';
  allowedPages?: string[];
}

export interface StaffPerformance {
  id: number;
  staffId: number;
  staffName: string;
  date: Date;
  appointmentsCompleted: number;
  salesAmount: number;
  notes?: string;
}

export interface UserPerformance {
  id: number;
  userId: number;
  userName: string;
  date: Date;
  activityType: string;
  details: string;
}

export interface UserActivity {
  id: number;
  userId: number;
  userName: string;
  timestamp: Date;
  activityType: string;
  details: string;
}
