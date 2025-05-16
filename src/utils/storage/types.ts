
export interface Appointment {
  id: number;
  customerId: number;
  customerName?: string;  // Added for UI display
  serviceId: number;
  service?: string;       // Added for UI display
  staffId: number;
  staffName?: string;     // Added for UI display
  staffColor?: string;    // Added for UI display
  date: string;
  time: string;
  notes?: string;
  status?: 'pending' | 'confirmed' | 'cancelled';
  cancellationNote?: string;
  note?: string;
  createdAt?: Date;
}

export interface Customer {
  id: number;
  firstName?: string;
  lastName?: string;
  name: string;          // Added since components use this
  phone: string;
  email?: string;
  address?: string;
  notes?: string;
  createdAt?: Date;
}

export interface CustomerRecord {
  id: number;
  customerId: number;
  date: string | Date;   // Allow both string and Date
  type: 'note' | 'appointment' | 'sale' | 'service' | 'product' | 'payment';
  description?: string;
  notes?: string;
  itemName?: string;     // Added for UI display
  amount?: number;       // Added for financial records
  itemId?: number;       // Reference to the sold item
  isPaid?: boolean;      // Payment status
  paymentMethod?: string; // How payment was made
  discount?: number;     // Any discount applied
  dueDate?: Date;        // When payment is due
  recordType?: 'debt' | 'payment'; // Type of financial record
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
  date: string | Date;  // Allow both string and Date
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
  displayName?: string;
  title?: string;
  color?: string;
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

export interface StockMovement {
  id: number;
  productId: number;
  quantity: number;
  type: 'in' | 'out';
  date: string;
  cost: number;
  description?: string;
}

export interface UserPerformance {
  userId: number;
  appointmentCount: number;
  salesCount: number;
  totalSales: number;
}

export interface UserActivity {
  id: number;
  userId: number;
  username: string;
  action: string;
  details: string;
  timestamp: string;
}
