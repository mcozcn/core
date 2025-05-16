
import { getFromStorage, setToStorage } from './core';
import { STORAGE_KEYS } from './storageKeys';
import type { StockMovement } from './types';

export const getStockMovements = async (): Promise<StockMovement[]> => {
  const result = await getFromStorage<StockMovement[]>(STORAGE_KEYS.STOCK_MOVEMENTS);
  return result || [];
};

export const setStockMovements = async (movements: StockMovement[]): Promise<void> => {
  await setToStorage(STORAGE_KEYS.STOCK_MOVEMENTS, movements);
};

export const addStockMovement = async (movement: Omit<StockMovement, 'id'>): Promise<StockMovement> => {
  const movements = await getStockMovements();
  
  const newMovement: StockMovement = {
    ...movement,
    id: Date.now(),
  };

  await setStockMovements([...movements, newMovement]);
  return newMovement;
};
