import { getFromStorage, setToStorage } from './core';
import type { User, UserPerformance, UserActivity } from './types';

export const getUsers = (): User[] =>
  getFromStorage<User>('users');

export const setUsers = (users: User[]): void =>
  setToStorage('users', users);

export const getUserPerformance = (): UserPerformance[] => 
  getFromStorage<UserPerformance>('userPerformance');

export const setUserPerformance = (performance: UserPerformance[]): void =>
  setToStorage('userPerformance', performance);

export const getUserActivities = (): UserActivity[] =>
  getFromStorage<UserActivity>('userActivities');

export const setUserActivities = (activities: UserActivity[]): void =>
  setToStorage('userActivities', activities);