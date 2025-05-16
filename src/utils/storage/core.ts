
import { getAllFromIDB, saveToIDB } from './idb';

// Convert promise-based getFromStorage to an async function
export const getFromStorage = async <T>(key: string): Promise<T[]> => {
  try {
    return await getAllFromIDB<T>(key);
  } catch (error) {
    console.error(`Error getting data from storage for key ${key}:`, error);
    // Fallback to localStorage
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  }
};

// Convert promise-based setToStorage to an async function
export const setToStorage = async <T>(key: string, data: T[]): Promise<void> => {
  try {
    await saveToIDB(key, data);
  } catch (error) {
    console.error(`Error setting data to storage for key ${key}:`, error);
    // Fallback to localStorage
    localStorage.setItem(key, JSON.stringify(data));
  }
};

export { getAllFromIDB, saveToIDB };
