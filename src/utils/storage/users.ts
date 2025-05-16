
import { getFromStorage, setToStorage } from './core';
import { STORAGE_KEYS } from './storageKeys';
import type { User } from './types';

// Store the current user in storage
export const getCurrentUser = async (): Promise<User | null> => {
  const result = await getFromStorage<User[]>('currentUser');
  return result && result.length > 0 ? result[0] : null;
};

export const setCurrentUser = async (user: User | null): Promise<void> => {
  if (user) {
    await setToStorage('currentUser', [user]);
  } else {
    await setToStorage('currentUser', []);
  }
};

export const getUsers = async (): Promise<User[]> => {
  const result = await getFromStorage<User[]>(STORAGE_KEYS.USERS);
  return result || [];
};

export const setUsers = async (users: User[]): Promise<void> => {
  await setToStorage(STORAGE_KEYS.USERS, users);
};
