import { getFromStorage, setToStorage } from './core';
import type { Cost } from './types';

export const getCosts = (): Cost[] =>
  getFromStorage<Cost>('costs');

export const setCosts = (costs: Cost[]): void =>
  setToStorage('costs', costs);