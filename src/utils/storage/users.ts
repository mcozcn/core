
import { getFromStorage, setToStorage } from './core';
import { STORAGE_KEYS } from './storageKeys';
import type { User } from './types';

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

export const getUsers = async (): Promise<User[]> => {
  const result = await getFromStorage<User>(STORAGE_KEYS.USERS);
  return result as User[];
};

export const setUsers = async (users: User[]): Promise<void> => {
  await setToStorage(STORAGE_KEYS.USERS, users);
};
