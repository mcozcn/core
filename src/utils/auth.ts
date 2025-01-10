export type UserRole = 'admin' | 'user';

export interface User {
  id: number;
  username: string;
  password: string;
  role: UserRole;
  allowedPages?: string[];
}

export interface AuthState {
  currentUser: User | null;
  users: User[];
}

const STORAGE_KEY = 'auth_state';

const initialState: AuthState = {
  currentUser: null,
  users: [
    {
      id: 1,
      username: 'admin',
      password: 'admin123',
      role: 'admin',
      allowedPages: ['dashboard', 'appointments', 'customers', 'services', 'stock', 'sales', 'costs', 'financial', 'backup', 'user-management']
    }
  ]
};

export const getAuthState = (): AuthState => {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : initialState;
};

export const setAuthState = (state: AuthState): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
};

export const login = (username: string, password: string): User | null => {
  const state = getAuthState();
  const user = state.users.find(u => u.username === username && u.password === password);
  
  if (user) {
    state.currentUser = user;
    setAuthState(state);
    return user;
  }
  
  return null;
};

export const logout = (): void => {
  const state = getAuthState();
  state.currentUser = null;
  setAuthState(state);
};

export const register = (username: string, password: string, role: UserRole = 'user'): User | null => {
  const state = getAuthState();
  
  if (state.users.some(u => u.username === username)) {
    return null;
  }
  
  const newUser: User = {
    id: state.users.length + 1,
    username,
    password,
    role,
    allowedPages: ['dashboard']
  };
  
  state.users.push(newUser);
  setAuthState(state);
  return newUser;
};

export const getCurrentUser = (): User | null => {
  return getAuthState().currentUser;
};

export const hasAccess = (page: string): boolean => {
  const currentUser = getCurrentUser();
  if (!currentUser) return false;
  if (currentUser.role === 'admin') return true;
  return currentUser.allowedPages?.includes(page) || false;
};