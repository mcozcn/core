
export type UserRole = 'admin' | 'manager' | 'user';

export interface User {
  id: number;
  username: string;
  passwordHash: string;
  displayName: string;
  email: string;
  role: UserRole;
  title: string;
  color: string;
  allowedPages: string[];
  canEdit: boolean;
  canDelete: boolean;
  isVisible: boolean;
  token?: string;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserRequest {
  username: string;
  password: string;
  displayName: string;
  title: string;
  allowedPages: string[];
  canEdit: boolean;
  canDelete: boolean;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export const AVAILABLE_PAGES = [
  { id: 'dashboard', label: 'Ana Sayfa', icon: '📊' },
  { id: 'appointments', label: 'Randevular', icon: '📅' },
  { id: 'customers', label: 'Müşteriler', icon: '👥' },
  { id: 'services', label: 'Hizmetler', icon: '✂️' },
  { id: 'stock', label: 'Stok Yönetimi', icon: '📦' },
  { id: 'sales', label: 'Satışlar', icon: '🛒' },
  { id: 'costs', label: 'Masraflar', icon: '💰' },
  { id: 'financial', label: 'Finansal Takip', icon: '💳' },
  { id: 'reports', label: 'Raporlar', icon: '📈' },
  { id: 'backup', label: 'Yedekleme', icon: '💾' },
  { id: 'performance', label: 'Performans', icon: '🎯' },
  { id: 'personnel', label: 'Personel', icon: '👤' }
] as const;
