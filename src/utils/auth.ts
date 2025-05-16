
export type UserRole = 'admin' | 'staff';

export interface User {
  id: number;
  username: string;
  displayName: string;
  title: string;
  role?: UserRole;
  color: string;
  allowedPages?: string[];
  canEdit?: boolean;
  canDelete?: boolean;
  createdAt: Date;
}

export interface AuthState {
  users: User[];
  currentUser?: User | null;
}

const STORAGE_KEY = 'auth_state';

const initialState: AuthState = {
  users: [
    {
      id: 1,
      username: 'staff1',
      displayName: 'Örnek Personel',
      title: 'Kuaför',
      role: 'staff',
      color: '#9b87f5',
      canEdit: true,
      canDelete: true,
      createdAt: new Date(),
      allowedPages: ['dashboard', 'appointments', 'customers', 'services', 'stock', 'sales', 'costs', 'financial', 'backup']
    }
  ],
  currentUser: null
};

export const getAuthState = (): AuthState => {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : initialState;
};

export const setAuthState = (state: AuthState): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
};

export const getAllUsers = (): User[] => {
  return getAuthState().users;
};

export const getCurrentUser = (): User | null => {
  const state = getAuthState();
  return state.currentUser || (state.users.length > 0 ? state.users[0] : null);
};

export const setCurrentUser = (user: User | null): void => {
  const state = getAuthState();
  state.currentUser = user;
  setAuthState(state);
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
  displayName: string,
  title: string,
  role: UserRole = 'staff',
  color: string = '#9b87f5',
  allowedPages: string[] = ['dashboard']
): User | null => {
  const state = getAuthState();
  
  const newUser: User = {
    id: Date.now(),
    username: `staff${state.users.length + 1}`,
    displayName,
    title,
    role,
    color,
    canEdit: false,
    canDelete: false,
    createdAt: new Date(),
    allowedPages
  };
  
  state.users.push(newUser);
  setAuthState(state);
  return newUser;
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
