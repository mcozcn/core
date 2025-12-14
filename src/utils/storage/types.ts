// All IDs are now strings to support both legacy number IDs and Supabase UUIDs
export type EntityId = string | number;

export interface Appointment {
  id: EntityId;
  customerId: EntityId;
  customerName: string;
  serviceId: EntityId;
  serviceName: string;
  service?: string;
  date: string;
  startTime: string;
  endTime: string;
  time?: string;
  price: number;
  notes?: string;
  status?: 'pending' | 'confirmed' | 'cancelled';
  staffId?: EntityId;
  staffName?: string;
  staffColor?: string;
  cancellationNote?: string;
  createdAt?: Date;
}

export interface Customer {
  id: EntityId;
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
  membershipPackageId?: EntityId;
  membershipStartDate?: Date;
  membershipEndDate?: Date;
  groupNumber?: number;
  timeSlot?: string;
  appointments?: Appointment[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CustomerRecord {
  id: EntityId;
  customerId: EntityId;
  customerName?: string;
  type: 'payment' | 'debt' | 'service' | 'product';
  itemId: EntityId;
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
  staffId?: EntityId;
  staffName?: string;
  commissionAmount?: number;
}

export interface Service {
  id: EntityId;
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
  id: EntityId;
  serviceId?: EntityId;
  serviceName?: string;
  price: number;
  saleDate: Date;
  customerId?: EntityId;
  customerName?: string;
  customerPhone?: string;
  personnelId?: EntityId;
  staffId?: EntityId;
  staffName?: string;
  commissionAmount?: number;
  totalPrice?: number;
  notes?: string;
  createdAt?: Date;
}

export interface StockItem {
  id: EntityId;
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
  productId?: EntityId;
  commissionRate?: number;
  lastUpdated?: Date;
  criticalLevel?: number;
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface StockMovement {
  id: EntityId;
  stockItemId: EntityId;
  stockItemName: string;
  quantityChange: number;
  movementDate: Date;
  type: 'in' | 'out';
  reason?: string;
  date?: Date;
  productId?: EntityId;
  description?: string;
  quantity?: number;
  cost?: number;
}

export interface Sale {
  id: EntityId;
  productId?: EntityId;
  customerId?: EntityId;
  customerName?: string;
  personnelId?: EntityId;
  stockItemId?: EntityId;
  stockItemName?: string;
  productName?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  saleDate: Date;
  date?: string;
  customerPhone?: string;
  staffId?: EntityId;
  staffName?: string;
  commissionAmount?: number;
  discount?: number;
  total?: number;
  paymentMethod?: string;
  notes?: string;
  createdAt?: Date;
}

export interface Cost {
  id: EntityId;
  name?: string;
  category: string;
  description?: string;
  amount: number;
  date?: Date;
  costDate?: Date;
  notes?: string;
  personnelId?: EntityId;
  createdAt?: Date;
}

export interface Payment {
  id: EntityId;
  customerId: EntityId;
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
  id: EntityId;
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
  id: EntityId;
  staffId: EntityId;
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
  id: EntityId;
  userId: EntityId;
  userName: string;
  date: Date;
  activityType: string;
  details: string;
  appointmentCount?: number;
  salesCount?: number;
  totalSales?: number;
}

export interface UserActivity {
  id: EntityId;
  userId: EntityId;
  userName: string;
  timestamp: Date;
  activityType: string;
  details: string;
  action?: string;
  username?: string;
}

export interface GroupSchedule {
  id: EntityId;
  customerId: EntityId;
  customerName: string;
  group: 'A' | 'B';
  timeSlot: string;
  startDate: Date;
  endDate?: Date;
  isActive: boolean;
  createdAt: Date;
}

export interface MemberSubscription {
  id: EntityId;
  customerId: EntityId;
  packageId: EntityId;
  packageName: string;
  startDate: Date;
  endDate: Date;
  price: number;
  status: 'active' | 'expired' | 'cancelled';
  groupScheduleId?: EntityId;
  createdAt: Date;
}
