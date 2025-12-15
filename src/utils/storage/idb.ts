
/**
 * IndexedDB Storage Utility
 * Provides a more robust storage solution than localStorage
 * that works across different browsers and contexts
 */

// Database configuration
const DB_NAME = 'glamAppointmentKeeperDB';
const DB_VERSION = 1;

// Required stores for the application
const REQUIRED_STORES = [
  'appointments', 'customers', 'services', 'stock', 'sales', 'serviceSales',
  'customerRecords', 'payments', 'costs', 'users', 'userPerformance',
  'userActivities', 'stockMovements', 'staff', 'groupSchedules'
];

// Ensure required stores exist by performing a version upgrade if necessary
export const ensureStoresExist = async (): Promise<void> => {
  try {
    const db = await initDB();
    const missing = REQUIRED_STORES.filter(name => !db.objectStoreNames.contains(name));
    if (missing.length === 0) {
      db.close();
      return;
    }

    const newVersion = db.version + 1;
    db.close();

    await new Promise<void>((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, newVersion);
      req.onupgradeneeded = () => {
        const upgradeDB = (req as IDBOpenDBRequest).result;
        missing.forEach(storeName => {
          if (!upgradeDB.objectStoreNames.contains(storeName)) {
            upgradeDB.createObjectStore(storeName, { keyPath: 'id' });
          }
        });
      };
      req.onsuccess = () => { try { req.result.close(); } catch(e) {}; resolve(); };
      req.onerror = () => { reject(req.error); };
    });
  } catch (err) {
    console.error('ensureStoresExist failed:', err);
  }
};

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

      // If any required stores are missing from an existing DB, perform a version upgrade
      const missing = REQUIRED_STORES.filter(name => !db.objectStoreNames.contains(name));
      if (missing.length > 0) {
        db.close();
        const upgradeReq = indexedDB.open(DB_NAME, db.version + 1);

        upgradeReq.onupgradeneeded = () => {
          const upgradeDB = (upgradeReq as IDBOpenDBRequest).result;
          missing.forEach(storeName => {
            if (!upgradeDB.objectStoreNames.contains(storeName)) {
              upgradeDB.createObjectStore(storeName, { keyPath: 'id' });
            }
          });
        };

        upgradeReq.onsuccess = () => {
          resolve((upgradeReq as IDBOpenDBRequest).result);
        };

        upgradeReq.onerror = (e) => {
          console.error('Failed to upgrade IndexedDB to add missing stores', e);
          reject('Failed to upgrade IndexedDB');
        };

        return;
      }

      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      
      // Create object stores for all data types
      const storeNames = [
        'appointments', 'customers', 'services', 'stock', 'sales', 'serviceSales',
        'customerRecords', 'payments', 'costs', 'users', 'userPerformance',
        'userActivities', 'stockMovements', 'staff'
        , 'groupSchedules'
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
    // If the object store is missing, this throws a NotFoundError.
    // Warn instead of erroring to reduce noisy logs in restricted contexts.
    if (error && (error.name === 'NotFoundError' || String(error).toLowerCase().includes('specified object stores'))) {
      console.warn(`IndexedDB store not found (${storeName}) - falling back to localStorage`);
    } else {
      console.error(`Error getting data from ${storeName}:`, error);
    }
    
    // Fall back to localStorage if IndexedDB fails
    const localData = localStorage.getItem(storeName);
    return localData ? JSON.parse(localData) : [];
  }
};

// Save items to a store
export const saveToIDB = async <T extends { id: number | string }>(storeName: string, items: T[]): Promise<void> => {
  try {
    let db = await initDB();

    // If the store is missing (DB created earlier without it), try to create it and retry
    if (!db.objectStoreNames.contains(storeName)) {
      console.warn(`IndexedDB store missing (${storeName}), attempting to create it via upgrade`);
      await ensureStoresExist();
      db = await initDB();
      if (!db.objectStoreNames.contains(storeName)) {
        throw new Error(`IndexedDB store ${storeName} not found after upgrade`);
      }
    }

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
        'userActivities', 'stockMovements', 'staff', 'groupSchedules'
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
