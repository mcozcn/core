
import { User, CreateUserRequest, AuthResponse, UserRole } from '@/types/user';
import { hashPassword, verifyPassword, generateToken } from '@/utils/auth/security';
import { getFromStorage, setToStorage } from './core';

// Export the User type so it can be imported from this module
export type { User } from '@/types/user';

const USERS_KEY = 'users_v3'; // Version changed to force database refresh
const CURRENT_USER_KEY = 'current_user_v3'; // Version changed to force database refresh

// Sadece admin kullanıcısı
const getDefaultUsers = async (): Promise<User[]> => [
  {
    id: 1,
    username: 'admin',
    passwordHash: await hashPassword('admin'),
    displayName: 'Sistem Yöneticisi',
    email: 'admin@core.com',
    role: 'admin',
    title: 'Administrator',
    color: '#DC2626',
    allowedPages: ['dashboard', 'appointments', 'customers', 'services', 'stock', 'sales', 'costs', 'financial', 'reports', 'backup', 'performance', 'personnel'],
    canEdit: true,
    canDelete: true,
    isVisible: false,
    createdAt: new Date(),
    updatedAt: new Date()
  }
  ,{
    id: 2,
    username: 'mos',
    passwordHash: await hashPassword('mos07'),
    displayName: 'MOS Admin',
    email: 'mos@core.com',
    role: 'admin',
    title: 'Administrator',
    color: '#111827',
    allowedPages: ['dashboard', 'appointments', 'customers', 'services', 'stock', 'sales', 'costs', 'financial', 'reports', 'backup', 'performance', 'personnel', 'users'],
    canEdit: true,
    canDelete: true,
    isVisible: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

// Veritabanını temizlemek için helper fonksiyon
const clearOldUserData = async (): Promise<void> => {
  try {
    // Eski versiyonları temizle
    localStorage.removeItem('users_v2');
    localStorage.removeItem('current_user_v2');
    localStorage.removeItem('users');
    localStorage.removeItem('currentUser');
    
    // IndexedDB'de eski verileri temizle
    if (typeof window !== 'undefined' && window.indexedDB) {
      const deleteOldDB = indexedDB.deleteDatabase('salon-storage');
      deleteOldDB.onsuccess = () => {
        console.log('Old database cleared successfully');
      };
    }
  } catch (error) {
    console.log('Error clearing old data:', error);
  }
};

export const getAllUsers = async (): Promise<User[]> => {
  try {
    // İlk çalıştırmada eski verileri temizle
    await clearOldUserData();
    
    const users = await getFromStorage<User>(USERS_KEY);
    if (users.length === 0) {
      const defaultUsers = await getDefaultUsers();
      await setToStorage(USERS_KEY, defaultUsers);
      return defaultUsers;
    }
    return users;
  } catch (error) {
    console.error('Error getting users:', error);
    const defaultUsers = await getDefaultUsers();
    await setToStorage(USERS_KEY, defaultUsers);
    return defaultUsers;
  }
};

export const getVisibleUsers = async (): Promise<User[]> => {
  const users = await getAllUsers();
  return users.filter(user => user.isVisible);
};

export const authenticateUser = async (username: string, password: string): Promise<AuthResponse | null> => {
  try {
    const users = await getAllUsers();
    const user = users.find(u => u.username === username);
    
    if (!user) return null;
    
    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) return null;
    
    const token = generateToken();
    
    // Token'ı kullanıcıya kaydet
    user.token = token;
    user.lastLogin = new Date();
    user.updatedAt = new Date();
    
    await updateUser(user.id, { token, lastLogin: new Date(), updatedAt: new Date() });
    
    return { user, token };
  } catch (error) {
    console.error('Authentication error:', error);
    return null;
  }
};

export const createUser = async (userData: CreateUserRequest): Promise<User> => {
  const users = await getAllUsers();
  const passwordHash = await hashPassword(userData.password);
  
  const newUser: User = {
    id: Date.now(),
    username: userData.username,
    passwordHash,
    displayName: userData.displayName,
    email: `${userData.username}@core.com`,
    role: 'user',
    title: userData.title,
    color: '#059669',
    allowedPages: userData.allowedPages,
    canEdit: userData.canEdit,
    canDelete: userData.canDelete,
    isVisible: true,
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  const updatedUsers = [...users, newUser];
  await setToStorage(USERS_KEY, updatedUsers);
  
  return newUser;
};

export const updateUser = async (userId: number, updates: Partial<User>): Promise<boolean> => {
  try {
    const users = await getAllUsers();
    const userIndex = users.findIndex(u => u.id === userId);
    
    if (userIndex === -1) return false;
    
    users[userIndex] = {
      ...users[userIndex],
      ...updates,
      updatedAt: new Date()
    };
    
    await setToStorage(USERS_KEY, users);
    return true;
  } catch (error) {
    console.error('Error updating user:', error);
    return false;
  }
};

export const deleteUser = async (userId: number): Promise<boolean> => {
  try {
    const users = await getAllUsers();
    const user = users.find(u => u.id === userId);
    
    if (!user || !user.isVisible) return false;
    
    const filteredUsers = users.filter(u => u.id !== userId);
    await setToStorage(USERS_KEY, filteredUsers);
    return true;
  } catch (error) {
    console.error('Error deleting user:', error);
    return false;
  }
};

export const getCurrentUser = async (): Promise<User | null> => {
  try {
    const userData = localStorage.getItem(CURRENT_USER_KEY);
    if (!userData) return null;
    
    const user = JSON.parse(userData) as User;
    return user;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
};

export const setCurrentUser = async (user: User | null): Promise<void> => {
  try {
    if (user) {
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(CURRENT_USER_KEY);
    }
  } catch (error) {
    console.error('Error setting current user:', error);
  }
};
