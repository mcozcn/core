
import { getFromStorage, setToStorage } from './core';
import type { Cost } from './types';
import { STORAGE_KEYS } from './storageKeys';

// Make the functions async to properly handle promises
export const getCosts = async (): Promise<Cost[]> => {
  const result = await getFromStorage<Cost>(STORAGE_KEYS.COSTS);
  return result as Cost[];
};

export const setCosts = async (costs: Cost[]): Promise<void> => {
  await setToStorage(STORAGE_KEYS.COSTS, costs);
};
