import { getFromStorage, setToStorage } from './core';
import { STORAGE_KEYS } from './storageKeys';
import type { StockItem, Sale } from './types';

export const getStock = (): StockItem[] =>
  getFromStorage<StockItem>(STORAGE_KEYS.STOCK);

export const setStock = (stock: StockItem[]): void =>
  setToStorage(STORAGE_KEYS.STOCK, stock);

export const getSales = (): Sale[] =>
  getFromStorage<Sale>(STORAGE_KEYS.SALES);

export const setSales = (sales: Sale[]): void =>
  setToStorage(STORAGE_KEYS.SALES, sales);

export const getProducts = getStock;
export const setProducts = setStock;