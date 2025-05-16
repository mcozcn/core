
import { getFromStorage, setToStorage } from './core';
import { STORAGE_KEYS } from './storageKeys';
import { User } from '../auth';

// Store the current user in storage
export const getCurrentUser = async (): Promise<User | null> =>
  await getFromStorage<User | null>('currentUser') || null;

export const setCurrentUser = async (user: User | null): Promise<void> =>
  await setToStorage('currentUser', user);

export const getUsers = async (): Promise<User[]> =>
  await getFromStorage<User[]>(STORAGE_KEYS.USERS) || [];

export const setUsers = async (users: User[]): Promise<void> =>
  await setToStorage(STORAGE_KEYS.USERS, users);
