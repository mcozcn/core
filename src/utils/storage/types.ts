
export interface Appointment {
  id: number;
  customerId: number;
  customerName: string;
  staffId: number;
  staffName: string;
  staffColor: string;
  date: string;
  time: string;
  service: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  note?: string;
  cancellationNote?: string;
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
  type: 'recurring' | 'one-time';
  sessionCount: number;
  createdAt: Date;
  commissionRate?: number; // Yeni eklenen komisyon oranı
}

export interface ServiceSale {
  id: number;
  serviceId: number;
  serviceName: string;
  price: number;
  customerName: string;
  customerPhone: string;
  saleDate: Date;
  staffId?: number;
  staffName?: string;
  commissionAmount?: number; // Yeni eklenen hakediş miktarı
}

export interface StockItem {
  id: number;
  productId: number;
  productName: string;
  quantity: number;
  price: number;
  cost: number;
  category: string;
  criticalLevel: number;
  createdAt: Date;
  lastUpdated: Date;
  commissionRate?: number; // Yeni eklenen komisyon oranı
}

export interface Sale {
  id: number;
  productId: number;
  productName: string;
  quantity: number;
  totalPrice: number;
  discount: number;
  customerName: string;
  customerPhone: string;
  saleDate: Date;
  staffId?: number;
  staffName?: string;
  commissionAmount?: number; // Yeni eklenen hakediş miktarı
}

export interface Cost {
  id: number;
  description: string;
  amount: number;
  category: string;
  date: Date;
  createdAt: Date;
}

export interface CustomerRecord {
  id: number;
  customerId: number;
  customerName?: string;
  debt?: number;
  payment?: number;
  date: Date;
  notes?: string;
  type: 'service' | 'product' | 'payment';
  itemId: number;
  itemName: string;
  amount: number;
  isPaid: boolean;
  dueDate?: Date;
  description?: string;
  recordType: 'debt' | 'payment';
  discount?: number;
  paymentMethod?: 'cash' | 'credit';
  quantity?: number;
  staffId?: number;
  staffName?: string;
  commissionAmount?: number; // Yeni eklenen hakediş miktarı
}

export interface Payment {
  id: number;
  customerId: number;
  amount: number;
  date: Date;
  type: 'credit' | 'debit';
  description: string;
  relatedRecordId?: number;
}

export interface User {
  id: number;
  username: string;
  password: string;
  role: 'admin' | 'staff';
  name: string;
  email: string;
  color?: string;
  createdAt: Date;
}

export interface UserPerformance {
  userId: number;
  appointmentCount: number;
  salesCount: number;
  totalSales: number;
  commissionAmount?: number; // Yeni eklenen toplam hakediş
  lastUpdated: Date;
}

export interface UserActivity {
  id: number;
  userId: number;
  username: string;
  action: string;
  details: string;
  timestamp: Date;
}

export interface StockMovement {
  id: number;
  productId: number;
  type: 'in' | 'out';
  quantity: number;
  cost: number;
  date: Date;
  description: string;
  createdAt: Date;
}

export interface StaffPerformance {
  id: number;
  name: string;
  role: string;
  servicesProvided: number;
  totalRevenue: number;
  appointmentsCount: number;
  avgRating: string;
  commissionEarned?: number; // Yeni eklenen hakediş miktarı
}

export interface CommissionRecord {
  id: number;
  staffId: number;
  staffName: string;
  customerId: number;
  customerName: string;
  itemType: 'service' | 'product';
  itemId: number;
  itemName: string;
  amount: number;
  commissionAmount: number;
  date: Date;
  isPaid: boolean;
  paidDate?: Date;
}
