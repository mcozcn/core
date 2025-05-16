
import { getFromStorage, setToStorage } from './core';
import { STORAGE_KEYS } from './storageKeys';

/**
 * Migration utility to safely migrate data between different storage formats
 * or structures without losing any user data
 */

export const CURRENT_DATA_VERSION = 1;
const VERSION_KEY = 'dataVersion';

// Check if data needs migration
export const checkMigrationNeeded = async (): Promise<boolean> => {
  try {
    const storedVersionString = localStorage.getItem(VERSION_KEY);
    const storedVersion = storedVersionString ? parseInt(storedVersionString, 10) : 0;
    
    return storedVersion < CURRENT_DATA_VERSION;
  } catch (error) {
    console.error('Error checking migration status:', error);
    return false;
  }
};

// Run migrations if needed
export const runMigrations = async (): Promise<void> => {
  try {
    const storedVersionString = localStorage.getItem(VERSION_KEY);
    const storedVersion = storedVersionString ? parseInt(storedVersionString, 10) : 0;
    
    if (storedVersion < CURRENT_DATA_VERSION) {
      console.log(`Migrating data from version ${storedVersion} to ${CURRENT_DATA_VERSION}`);
      
      // Run migration steps based on the current version
      if (storedVersion < 1) {
        await migrateToV1();
      }
      
      // Save the new version
      localStorage.setItem(VERSION_KEY, CURRENT_DATA_VERSION.toString());
    }
  } catch (error) {
    console.error('Error during data migration:', error);
  }
};

// Migration from initial state to version 1
const migrateToV1 = async (): Promise<void> => {
  try {
    // This is just an example migration
    // In a real migration, you might need to transform data structures
    
    // For each data type you need to migrate:
    for (const key of Object.values(STORAGE_KEYS)) {
      const data = await getFromStorage(key);
      if (data && Array.isArray(data)) {
        // Example: ensure all items have a 'lastUpdated' field
        const updatedData = data.map(item => {
          // Check if lastUpdated exists and add if not
          if (!item.lastUpdated) {
            return {
              ...item,
              lastUpdated: new Date().toISOString()
            };
          }
          return item;
        });
        
        await setToStorage(key, updatedData);
      }
    }
    
    console.log('Migration to V1 completed');
  } catch (error) {
    console.error('Error during V1 migration:', error);
    throw error;
  }
};
