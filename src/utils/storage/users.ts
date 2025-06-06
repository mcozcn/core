
import { getFromStorage, setToStorage } from './core';
import { STORAGE_KEYS } from './storageKeys';
import type { User } from './types';

// Re-export the User type from types.ts
export type { User } from './types';

// Önceden tanımlı kullanıcılar
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
  },
  {
    id: 2,
    username: 'mco',
    password: '1474',
    displayName: 'MCO Power User',
    email: 'mco@salon.com',
    role: 'power_user',
    title: 'Power User',
    color: '#7C3AED',
    allowedPages: ['dashboard', 'appointments', 'customers', 'services', 'stock', 'sales', 'costs', 'financial', 'reports', 'backup', 'personnel', 'performance'],
    canEdit: true,
    canDelete: true,
    createdAt: new Date(),
    isVisible: false // Gizli kullanıcı
  },
  {
    id: 3,
    username: 'personel',
    password: 'personel',
    displayName: 'Demo Personel',
    email: 'personel@salon.com',
    role: 'staff',
    title: 'Personel',
    color: '#059669',
    allowedPages: ['dashboard', 'appointments', 'customers', 'services'],
    canEdit: false,
    canDelete: false,
    createdAt: new Date(),
    isVisible: true // Görünür kullanıcı
  }
];

// Get all users from storage
export const getUsers = async (): Promise<User[]> => {
  try {
    const users = await getFromStorage<User>(STORAGE_KEYS.USERS);
    
    if (users.length === 0) {
      const defaultUsers = getDefaultUsers();
      await setToStorage(STORAGE_KEYS.USERS, defaultUsers);
      return defaultUsers;
    }
    
    return users as User[];
  } catch (error) {
    console.error('Error getting users:', error);
    // Hata durumunda default kullanıcıları döndür
    const defaultUsers = getDefaultUsers();
    await setToStorage(STORAGE_KEYS.USERS, defaultUsers);
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
