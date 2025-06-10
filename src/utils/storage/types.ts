
export interface Appointment {
  id: number;
  customerId: number;
  customerName: string;
  serviceId: number;
  serviceName: string;
  service?: string; // For backward compatibility
  date: string; // Changed from Date to string for consistency
  startTime: string;
  endTime: string;
  time?: string; // Additional time property used in many components
  price: number;
  notes?: string;
  status?: 'pending' | 'confirmed' | 'cancelled';
  staffId?: number;
  staffName?: string;
  staffColor?: string;
  cancellationNote?: string;
  createdAt?: Date;
}

export interface Customer {
  id: number;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  notes?: string;
  appointments?: Appointment[];
  createdAt?: Date;
}

export interface CustomerRecord {
  id: number;
  customerId: number;
  customerName?: string;
  type: 'payment' | 'debt' | 'service' | 'product';
  itemId: number;
  itemName: string;
  amount: number;
  date: Date;
  dueDate?: Date;
  isPaid?: boolean;
  description?: string;
  recordType?: 'debt' | 'payment' | 'installment' | 'service' | 'product';
  paymentMethod?: string;
  discount?: number;
  quantity?: number;
  staffId?: number;
  staffName?: string;
  commissionAmount?: number;
}

export interface Service {
  id: number;
  name: string;
  description?: string;
  price: number;
  duration: number;
  type?: 'one-time' | 'recurring';
  sessionCount?: number;
  commissionRate?: number;
  createdAt?: Date;
}

export interface ServiceSale {
  id: number;
  serviceId: number;
  serviceName: string;
  price: number;
  saleDate: Date;
  customerId?: number;
  customerName?: string;
  customerPhone?: string;
  staffId?: number;
  staffName?: string;
  commissionAmount?: number;
  totalPrice?: number;
}

export interface StockItem {
  id: number;
  name: string;
  productName?: string; // For backward compatibility
  description?: string;
  price: number;
  quantity: number;
  unit: string;
  category: string;
  cost?: number;
  productId?: number; // For backward compatibility
  commissionRate?: number;
  lastUpdated?: Date;
  criticalLevel?: number;
}

export interface StockMovement {
  id: number;
  stockItemId: number;
  stockItemName: string;
  quantityChange: number;
  movementDate: Date;
  type: 'in' | 'out';
  reason?: string;
  date?: Date; // For backward compatibility
  productId?: number; // For backward compatibility
  description?: string;
  quantity?: number;
  cost?: number;
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
  date?: string; // For backward compatibility
  productId?: number; // For backward compatibility
  productName?: string; // For backward compatibility
  customerPhone?: string;
  staffId?: number;
  staffName?: string;
  commissionAmount?: number;
  discount?: number;
  total?: number;
  paymentMethod?: string;
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
  color?: string;
  title?: string;
}

export interface StaffPerformance {
  id: number;
  staffId: number;
  staffName: string;
  name?: string; // For backward compatibility
  role?: string;
  date: Date;
  appointmentsCompleted: number;
  appointmentsCount?: number;
  confirmedAppointments?: number;
  cancelledAppointments?: number;
  pendingAppointments?: number;
  servicesProvided?: number;
  productSales?: number;
  salesAmount: number;
  totalRevenue?: number;
  totalCommission?: number;
  avgRating?: number;
  notes?: string;
}

export interface UserPerformance {
  id: number;
  userId: number;
  userName: string;
  date: Date;
  activityType: string;
  details: string;
  appointmentCount?: number;
  salesCount?: number;
  totalSales?: number;
}

export interface UserActivity {
  id: number;
  userId: number;
  userName: string;
  timestamp: Date;
  activityType: string;
  details: string;
  action?: string; // For backward compatibility
  username?: string; // For backward compatibility
}
