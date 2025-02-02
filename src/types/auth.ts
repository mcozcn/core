export type UserRole = 'admin' | 'staff';

export interface User {
  id: number;
  username: string;
  password: string;
  role: UserRole;
  name: string;
  email: string;
  color?: string;
  createdAt: Date;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}