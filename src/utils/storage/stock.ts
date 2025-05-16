
import { getFromStorage, setToStorage } from './core';
import { STORAGE_KEYS } from './storageKeys';
import type { StockItem, Sale } from './types';

export const getStock = async (): Promise<StockItem[]> =>
  await getFromStorage<StockItem[]>(STORAGE_KEYS.STOCK) || [];

export const setStock = async (stock: StockItem[]): Promise<void> =>
  await setToStorage(STORAGE_KEYS.STOCK, stock);

export const getSales = async (): Promise<Sale[]> =>
  await getFromStorage<Sale[]>(STORAGE_KEYS.SALES) || [];

export const setSales = async (sales: Sale[]): Promise<void> =>
  await setToStorage(STORAGE_KEYS.SALES, sales);

export const getProducts = getStock;
export const setProducts = setStock;
