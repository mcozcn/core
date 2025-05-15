
import { getFromStorage, setToStorage } from './core';
import type { Cost } from './types';
import { STORAGE_KEYS } from './storageKeys';

export const getCosts = async (): Promise<Cost[]> =>
  await getFromStorage<Cost>(STORAGE_KEYS.COSTS);

export const setCosts = async (costs: Cost[]): Promise<void> =>
  await setToStorage(STORAGE_KEYS.COSTS, costs);
