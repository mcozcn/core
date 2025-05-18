
import { getFromStorage, setToStorage } from './core';
import { STORAGE_KEYS } from './storageKeys';
import type { User } from './types';

// Re-export the User type from types.ts
export type { User } from './types';

// Get all users from storage
export const getUsers = async (): Promise<User[]> => {
  // Initialize default users if they don't exist
  const users = await getFromStorage<User>(STORAGE_KEYS.USERS);
  
  if (users.length === 0) {
    const defaultUsers: User[] = [
      {
        id: 1,
        username: 'admin',
        password: 'admin',
        displayName: 'Administrator',
        email: 'admin@example.com', 
        role: 'admin',
        title: 'Sistem Yöneticisi',
        color: '#9b87f5',
        allowedPages: ['dashboard', 'appointments', 'customers', 'services', 'stock', 'sales', 'costs', 'financial', 'reports', 'backup', 'users', 'personnel', 'performance'],
        canEdit: true,
        canDelete: true,
        createdAt: new Date()
      },
      {
        id: 2,
        username: 'user',
        password: 'user',
        displayName: 'Demo User',
        email: 'user@example.com',
        role: 'staff',
        title: 'Personel',
        color: '#6E59A5',
        allowedPages: ['dashboard', 'appointments', 'customers'],
        canEdit: false,
        canDelete: false,
        createdAt: new Date()
      }
    ];
    
    await setToStorage(STORAGE_KEYS.USERS, defaultUsers);
    return defaultUsers;
  }
  
  return users as User[];
};

// Store the current user in storage
export const getCurrentUser = async (): Promise<User | null> => {
  const result = await getFromStorage<User>('currentUser');
  if (Array.isArray(result) && result.length > 0) {
    return result[0] as User;
  }
  return null;
};

export const setCurrentUser = async (user: User | null): Promise<void> => {
  if (user) {
    await setToStorage('currentUser', [user] as unknown as User[]);
  } else {
    await setToStorage('currentUser', [] as unknown as User[]);
  }
};

export const setUsers = async (users: User[]): Promise<void> => {
  await setToStorage(STORAGE_KEYS.USERS, users);
};

// Add a new user
export const addUser = async (user: Omit<User, 'id'>): Promise<User> => {
  const users = await getUsers();
  const newUser = {
    ...user,
    id: Date.now(),
    createdAt: new Date()
  };
  
  await setUsers([...users, newUser]);
  return newUser;
};

// Delete a user by ID
export const deleteUser = async (userId: number): Promise<boolean> => {
  const users = await getUsers();
  const filteredUsers = users.filter(user => user.id !== userId);
  
  if (filteredUsers.length === users.length) {
    return false; // User not found
  }
  
  await setUsers(filteredUsers);
  return true;
};

// Update user permissions
export const updateUserPermissions = async (
  userId: number, 
  updates: Partial<Pick<User, 'allowedPages' | 'canEdit' | 'canDelete' | 'color'>>
): Promise<boolean> => {
  const users = await getUsers();
  const userIndex = users.findIndex(u => u.id === userId);
  
  if (userIndex === -1) return false;
  
  users[userIndex] = {
    ...users[userIndex],
    ...updates
  };
  
  await setUsers(users);
  return true;
};
