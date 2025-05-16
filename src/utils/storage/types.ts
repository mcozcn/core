export interface Appointment {
  id: number;
  customerId: number;
  serviceId: number;
  staffId: number;
  date: string;
  time: string;
  notes?: string;
}

export interface Customer {
  id: number;
  firstName: string;
  lastName: string;
  phone: string;
  email?: string;
  address?: string;
  notes?: string;
}

export interface CustomerRecord {
  id: number;
  customerId: number;
  date: string;
  type: 'note' | 'appointment' | 'sale';
  description: string;
  notes?: string;
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
  saleId: number;
  serviceId: number;
  price: number;
  saleDate: string;
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
}

export interface Sale {
  id: number;
  customerId: number;
  date: string;
  total: number;
  paymentMethod: string;
  notes?: string;
}

export interface Cost {
  id: number;
  date: string;
  amount: number;
  description: string;
  category: string;
}

export interface Payment {
  id: number;
  saleId: number;
  date: string;
  amount: number;
  paymentMethod: string;
  notes?: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  role: 'admin' | 'staff';
}

export interface StaffPerformance {
  id: number;
  name: string;
  role: string;
  servicesProvided: number;
  totalRevenue: number;
  appointmentsCount: number;
  avgRating: number;
}

// Add StockMovement type
export interface StockMovement {
  id: number;
  productId: number;
  quantity: number;
  type: 'in' | 'out';
  date: string;
  cost: number;
  description?: string;
}
