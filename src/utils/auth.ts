export type UserRole = 'admin' | 'user';

export interface User {
  id: number;
  username: string;
  password: string;
  role: UserRole;
  allowedPages?: string[];
  displayName?: string;
  color?: string;
  canEdit?: boolean;
  canDelete?: boolean;
  createdAt: Date;
  createdBy?: number;
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
      displayName: 'Admin',
      canEdit: true,
      canDelete: true,
      createdAt: new Date(),
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

export const getCurrentUser = (): User | null => {
  return getAuthState().currentUser;
};

export const getAllUsers = (): User[] => {
  return getAuthState().users;
};

export const deleteUser = (userId: number): boolean => {
  const state = getAuthState();
  const userIndex = state.users.findIndex(u => u.id === userId);
  
  if (userIndex === -1) return false;
  
  state.users.splice(userIndex, 1);
  setAuthState(state);
  return true;
};

export const register = (
  username: string, 
  password: string, 
  role: UserRole = 'user',
  displayName?: string,
  color?: string,
  allowedPages: string[] = ['dashboard']
): User | null => {
  const state = getAuthState();
  const currentUser = getCurrentUser();
  
  if (state.users.some(u => u.username === username)) {
    return null;
  }
  
  const newUser: User = {
    id: state.users.length + 1,
    username,
    password,
    role,
    displayName,
    color,
    canEdit: false,
    canDelete: false,
    createdAt: new Date(),
    createdBy: currentUser?.id,
    allowedPages
  };
  
  state.users.push(newUser);
  setAuthState(state);
  return newUser;
};

export const hasAccess = (page: string): boolean => {
  const currentUser = getCurrentUser();
  if (!currentUser) return false;
  if (currentUser.role === 'admin') return true;
  return currentUser.allowedPages?.includes(page) || false;
};

export const hasPermission = (permission: 'edit' | 'delete'): boolean => {
  const currentUser = getCurrentUser();
  if (!currentUser) return false;
  if (currentUser.role === 'admin') return true;
  return permission === 'edit' ? currentUser.canEdit || false : currentUser.canDelete || false;
};

export const updateUserPermissions = (
  userId: number, 
  updates: Partial<Pick<User, 'allowedPages' | 'canEdit' | 'canDelete' | 'color'>>
): boolean => {
  const state = getAuthState();
  const userIndex = state.users.findIndex(u => u.id === userId);
  
  if (userIndex === -1) return false;
  
  state.users[userIndex] = {
    ...state.users[userIndex],
    ...updates
  };
  
  setAuthState(state);
  return true;
};