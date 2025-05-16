
import { getFromStorage, setToStorage } from './core';
import { STORAGE_KEYS } from './storageKeys';

export interface StockMovement {
  id: number;
  productId: number;
  quantity: number;
  type: 'in' | 'out';
  date: string;
  cost: number;
  description?: string;
}

export const getStockMovements = async (): Promise<StockMovement[]> =>
  await getFromStorage<StockMovement>(STORAGE_KEYS.STOCK_MOVEMENTS) || [];

export const setStockMovements = async (movements: StockMovement[]): Promise<void> =>
  await setToStorage(STORAGE_KEYS.STOCK_MOVEMENTS, movements);

export const addStockMovement = async (movement: Omit<StockMovement, 'id'>): Promise<void> => {
  const movements = await getStockMovements();
  
  const newMovement: StockMovement = {
    ...movement,
    id: Date.now(),
  };

  await setStockMovements([...movements, newMovement]);
};
