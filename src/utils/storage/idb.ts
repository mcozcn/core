
/**
 * IndexedDB Storage Utility
 * Provides a more robust storage solution than localStorage
 * that works across different browsers and contexts
 */

// Database configuration
const DB_NAME = 'glamAppointmentKeeperDB';
const DB_VERSION = 1;

// Initialize the database
const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = (event) => {
      console.error('IndexedDB error:', event);
      reject('Failed to open IndexedDB');
    };

    request.onsuccess = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      
      // Create object stores for all data types
      const storeNames = [
        'appointments', 'customers', 'services', 'stock', 'sales', 'serviceSales',
        'customerRecords', 'payments', 'costs', 'users', 'userPerformance',
        'userActivities', 'stockMovements', 'staff'
      ];
      
      storeNames.forEach(storeName => {
        if (!db.objectStoreNames.contains(storeName)) {
          db.createObjectStore(storeName, { keyPath: 'id' });
        }
      });
    };
  });
};

// Get all items from a store
export const getAllFromIDB = async <T>(storeName: string): Promise<T[]> => {
  try {
    const db = await initDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAll();
      
      request.onerror = () => {
        reject('Error fetching data from IndexedDB');
      };
      
      request.onsuccess = () => {
        resolve(request.result as T[]);
      };
    });
  } catch (error) {
    console.error(`Error getting data from ${storeName}:`, error);
    
    // Fall back to localStorage if IndexedDB fails
    const localData = localStorage.getItem(storeName);
    return localData ? JSON.parse(localData) : [];
  }
};

// Save items to a store
export const saveToIDB = async <T extends { id: number | string }>(storeName: string, items: T[]): Promise<void> => {
  try {
    const db = await initDB();
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    
    // Clear existing data
    store.clear();
    
    // Add all items
    items.forEach(item => {
      store.add(item);
    });
    
    // Also save to localStorage as backup
    localStorage.setItem(storeName, JSON.stringify(items));
    
    return new Promise((resolve, reject) => {
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject('Error saving data to IndexedDB');
    });
  } catch (error) {
    console.error(`Error saving data to ${storeName}:`, error);
    
    // Fall back to localStorage if IndexedDB fails
    localStorage.setItem(storeName, JSON.stringify(items));
  }
};

// Utility function to migrate existing localStorage data to IndexedDB
export const migrateLocalStorageToIDB = async (): Promise<void> => {
  try {
    const storeNames = [
      'appointments', 'customers', 'services', 'stock', 'sales', 'serviceSales',
      'customerRecords', 'payments', 'costs', 'users', 'userPerformance',
      'userActivities', 'stockMovements', 'staff'
    ];
    
    for (const storeName of storeNames) {
      const localData = localStorage.getItem(storeName);
      if (localData) {
        const items = JSON.parse(localData);
        if (Array.isArray(items) && items.length > 0) {
          await saveToIDB(storeName, items);
        }
      }
    }
    
    console.log('Migration from localStorage to IndexedDB completed');
  } catch (error) {
    console.error('Error during migration:', error);
  }
};
