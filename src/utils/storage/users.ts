
import { getFromStorage, setToStorage } from './core';
import { STORAGE_KEYS } from './storageKeys';
import type { User } from './types';

// Re-export the User type from types.ts
export type { User } from './types';

// Storage key'i güncelleyelim
const USERS_STORAGE_KEY = 'users_v3';

// Sadece admin kullanıcısı
const getDefaultUsers = (): User[] => [
  {
    id: 1,
    username: 'admin',
    password: 'admin',
    displayName: 'Sistem Yöneticisi',
    email: 'admin@salon.com', 
    role: 'admin',
    title: 'Administrator',
    color: '#DC2626',
    allowedPages: ['dashboard', 'appointments', 'customers', 'services', 'stock', 'sales', 'costs', 'financial', 'reports', 'backup', 'users', 'personnel', 'performance'],
    canEdit: true,
    canDelete: true,
    createdAt: new Date(),
    isVisible: false // Gizli kullanıcı
  }
];

// Get all users from storage
export const getUsers = async (): Promise<User[]> => {
  try {
    const users = await getFromStorage<User>(USERS_STORAGE_KEY);
    
    if (users.length === 0) {
      const defaultUsers = getDefaultUsers();
      await setToStorage(USERS_STORAGE_KEY, defaultUsers);
      return defaultUsers;
    }
    
    return users as User[];
  } catch (error) {
    console.error('Error getting users:', error);
    // Hata durumunda default kullanıcıları döndür
    const defaultUsers = getDefaultUsers();
    await setToStorage(USERS_STORAGE_KEY, defaultUsers);
    return defaultUsers;
  }
};

// Get only visible users (staff users)
export const getVisibleUsers = async (): Promise<User[]> => {
  const allUsers = await getUsers();
  return allUsers.filter(user => user.isVisible !== false);
};

// Store the current user in storage
export const getCurrentUser = async (): Promise<User | null> => {
  try {
    const result = await getFromStorage<User>('currentUser');
    if (Array.isArray(result) && result.length > 0) {
      return result[0] as User;
    }
    return null;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
};

export const setCurrentUser = async (user: User | null): Promise<void> => {
  try {
    if (user) {
      await setToStorage('currentUser', [user] as unknown as User[]);
    } else {
      await setToStorage('currentUser', [] as unknown as User[]);
    }
  } catch (error) {
    console.error('Error setting current user:', error);
  }
};

export const setUsers = async (users: User[]): Promise<void> => {
  await setToStorage(STORAGE_KEYS.USERS, users);
};

// Add a new user
export const addUser = async (userData: Omit<User, 'id' | 'createdAt'>): Promise<User> => {
  const users = await getUsers();
  const newUser: User = {
    ...userData,
    id: Date.now(),
    createdAt: new Date(),
    isVisible: true // Yeni eklenen kullanıcılar görünür
  };
  
  console.log('Adding new user:', newUser);
  await setUsers([...users, newUser]);
  return newUser;
};

// Delete a user by ID (sadece görünür kullanıcılar silinebilir)
export const deleteUser = async (userId: number): Promise<boolean> => {
  const users = await getUsers();
  const userToDelete = users.find(u => u.id === userId);
  
  if (!userToDelete || userToDelete.isVisible === false) {
    console.log('Cannot delete protected user');
    return false;
  }
  
  const filteredUsers = users.filter(user => user.id !== userId);
  await setUsers(filteredUsers);
  return true;
};

// Update user permissions
export const updateUser = async (
  userId: number, 
  updates: Partial<User>
): Promise<boolean> => {
  const users = await getUsers();
  const userIndex = users.findIndex(u => u.id === userId);
  
  if (userIndex === -1) return false;
  
  // Korumalı kullanıcıların rolü değiştirilemez
  const user = users[userIndex];
  if (user.isVisible === false && updates.role) {
    delete updates.role;
  }
  
  users[userIndex] = {
    ...users[userIndex],
    ...updates
  };
  
  await setUsers(users);
  return true;
};

// Authenticate user
export const authenticateUser = async (username: string, password: string): Promise<User | null> => {
  const users = await getUsers();
  const user = users.find(u => u.username === username && u.password === password);
  return user || null;
};
