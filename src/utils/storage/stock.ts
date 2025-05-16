
import { getFromStorage, setToStorage } from './core';
import { STORAGE_KEYS } from './storageKeys';
import type { StockItem, Sale } from './types';

export const getStock = async (): Promise<StockItem[]> => {
  const result = await getFromStorage<StockItem>(STORAGE_KEYS.STOCK);
  return result as StockItem[];
};

export const setStock = async (stock: StockItem[]): Promise<void> => {
  await setToStorage(STORAGE_KEYS.STOCK, stock);
};

export const getSales = async (): Promise<Sale[]> => {
  const result = await getFromStorage<Sale>(STORAGE_KEYS.SALES);
  return result as Sale[];
};

export const setSales = async (sales: Sale[]): Promise<void> => {
  await setToStorage(STORAGE_KEYS.SALES, sales);
};

// Add aliases for the functions used in localStorage/index.ts
export const getStockItems = getStock;
export const setStockItems = setStock;
