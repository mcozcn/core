// All IDs are now strings to support both legacy number IDs and Supabase UUIDs
export type EntityId = string | number;

export interface Appointment {
  id: EntityId;
  customerId: EntityId;
  customerName: string;
  serviceId: EntityId;
  serviceName: string;
  service?: string;
  time?: string;
  price: number;
  notes?: string;
  status?: 'pending' | 'confirmed' | 'cancelled';
  staffId?: string | number;
  staffName?: string;
  staffColor?: string;
  cancellationNote?: string;
  createdAt?: Date;
}

export interface Customer {
  id: string | number;
  name: string;
  firstName?: string;
  lastName?: string;
  phone: string;
  email?: string;
  address?: string;
  notes?: string;
  gender?: string;
  birthDate?: Date;
  totalDebt?: number;
  isActive?: boolean;
  membershipPackageId?: string | number;
  membershipStartDate?: Date;
  membershipEndDate?: Date;
  groupNumber?: number;
  timeSlot?: string;
  appointments?: Appointment[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CustomerRecord {
  id: string | number;
  customerId: string | number;
  customerName?: string;
  type: 'payment' | 'debt' | 'service' | 'product';
  itemId: string | number;
  itemName: string;
  amount: number;
  date: Date;
  dueDate?: Date;
  isPaid?: boolean;
  description?: string;
  recordType?: 'debt' | 'payment' | 'installment' | 'service' | 'product' | 'installment_payment';
  paymentMethod?: string;
  discount?: number;
  quantity?: number;
  staffId?: string | number;
  staffName?: string;
  commissionAmount?: number;
}

export interface Service {
  id: string | number;
  name: string;
  description?: string;
  price: number;
  duration: number;
  category?: string;
  type?: 'one-time' | 'recurring';
  sessionCount?: number;
  commissionRate?: number;
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ServiceSale {
  id: string | number;
  serviceId?: string | number;
  serviceName?: string;
  price: number;
  saleDate: Date;
  customerId?: string | number;
  customerName?: string;
  customerPhone?: string;
  personnelId?: string | number;
  staffId?: string | number;
  staffName?: string;
  commissionAmount?: number;
  totalPrice?: number;
  notes?: string;
  createdAt?: Date;
}

export interface StockItem {
  id: string | number;
  name: string;
  productName?: string;
  description?: string;
  price?: number;
  purchasePrice?: number;
  salePrice?: number;
  quantity?: number;
  stockQuantity?: number;
  minStockLevel?: number;
  unit?: string;
  category?: string;
  cost?: number;
  productId?: string | number;
  commissionRate?: number;
  lastUpdated?: Date;
  criticalLevel?: number;
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface StockMovement {
  id: string | number;
  stockItemId: string | number;
  stockItemName: string;
  quantityChange: number;
  movementDate: Date;
  type: 'in' | 'out';
  reason?: string;
  date?: Date;
  productId?: string | number;
  description?: string;
  quantity?: number;
  cost?: number;
}

export interface Sale {
  id: string | number;
  productId?: string | number;
  customerId?: string | number;
  customerName?: string;
  personnelId?: string | number;
  stockItemId?: string | number;
  stockItemName?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  saleDate: Date;
  date?: string;
  productName?: string;
  customerPhone?: string;
  staffId?: string | number;
  staffName?: string;
  commissionAmount?: number;
  discount?: number;
  total?: number;
  paymentMethod?: string;
  notes?: string;
  createdAt?: Date;
}

export interface Cost {
  id: string | number;
  name?: string;
  category: string;
  description?: string;
  amount: number;
  date?: Date;
  costDate?: Date;
  notes?: string;
  personnelId?: string | number;
  createdAt?: Date;
}

export interface Payment {
  id: string | number;
  customerId: string | number;
  customerName?: string;
  amount: number;
  date?: Date;
  paymentDate?: Date;
  dueDate?: Date;
  paymentType?: string;
  method?: string;
  isPaid?: boolean;
  notes?: string;
  createdAt?: Date;
}

export interface User {
  id: string | number;
  username: string;
  password?: string;
  displayName: string;
  role: 'admin' | 'manager' | 'user' | 'power_user' | 'staff';
  allowedPages?: string[];
  color?: string;
  title?: string;
  email?: string;
  isVisible?: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
  createdAt?: Date;
}

export interface StaffPerformance {
  id: string | number;
  staffId: string | number;
  staffName: string;
  name?: string;
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
  id: string | number;
  userId: string | number;
  userName: string;
  date: Date;
  activityType: string;
  details: string;
  appointmentCount?: number;
  salesCount?: number;
  totalSales?: number;
}

export interface UserActivity {
  id: string | number;
  userId: string | number;
  userName: string;
  timestamp: Date;
  activityType: string;
  details: string;
  action?: string;
  username?: string;
}

export interface GroupSchedule {
  id: string | number;
  customerId: string | number;
  customerName: string;
  group: 'A' | 'B';
  timeSlot: string;
  startDate: Date;
  endDate?: Date;
  isActive: boolean;
  createdAt: Date;
}

export interface MemberSubscription {
  id: string | number;
  customerId: string | number;
  packageId: string | number;
  packageName: string;
  startDate: Date;
  endDate: Date;
  price: number;
  status: 'active' | 'expired' | 'cancelled';
  groupScheduleId?: string | number;
  createdAt: Date;
}
