
import { saveToIDB } from './idb';

export const checkMigrationNeeded = async (): Promise<boolean> => {
  // Simple check - if any data exists in localStorage but not in IndexedDB
  try {
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') return false;

    const hasLocalStorageData = Object.keys(localStorage).some(key =>
      ['stock', 'appointments', 'customers', 'services', 'sales', 'costs', 'payments'].includes(key)
    );

    return hasLocalStorageData;
  } catch (error) {
    // In some contexts (sandboxed frames or restricted environments) accessing storage
    // may throw. Treat this as "no migration needed" to avoid breaking the app.
    console.warn('checkMigrationNeeded: storage access not available in this context:', error);
    return false;
  }
};

export const runMigrations = async (): Promise<void> => {
  await migrateAllData();
};

export const migrateStockData = async () => {
  try {
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') return;
    let storedData: string | null = null;
    try { storedData = localStorage.getItem('stock'); } catch (err) { storedData = null; }
    
    if (storedData) {
      const parsedData = JSON.parse(storedData);
      
      if (Array.isArray(parsedData)) {
        // Fix the issue with lastUpdated and type casting
        const migratedData = parsedData.map((item: any) => ({
          ...item,
          // Ensure lastUpdated is a Date if it exists
          lastUpdated: item.lastUpdated ? new Date(item.lastUpdated) : new Date(),
          // Add any missing fields that might cause type errors
        }));
        
        // Save to IndexedDB
        await saveToIDB('stock', migratedData);
        console.log('Stock data migrated to IndexedDB');
      }
    }
  } catch (error) {
    console.error('Error migrating stock data:', error);
  }
};

export const migrateAppointmentsData = async () => {
  try {
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') return;
    let storedData: string | null = null;
    try { storedData = localStorage.getItem('appointments'); } catch (err) { storedData = null; }
    
    if (storedData) {
      const parsedData = JSON.parse(storedData);
      
      if (Array.isArray(parsedData)) {
        await saveToIDB('appointments', parsedData);
        console.log('Appointments data migrated to IndexedDB');
      }
    }
  } catch (error) {
    console.error('Error migrating appointments data:', error);
  }
};

export const migrateCustomersData = async () => {
  try {
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') return;
    let storedData: string | null = null;
    try { storedData = localStorage.getItem('customers'); } catch (err) { storedData = null; }
    
    if (storedData) {
      const parsedData = JSON.parse(storedData);
      
      if (Array.isArray(parsedData)) {
        await saveToIDB('customers', parsedData);
        console.log('Customers data migrated to IndexedDB');
      }
    }
  } catch (error) {
    console.error('Error migrating customers data:', error);
  }
};

export const migrateServicesData = async () => {
  try {
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') return;
    let storedData: string | null = null;
    try { storedData = localStorage.getItem('services'); } catch (err) { storedData = null; }
    
    if (storedData) {
      const parsedData = JSON.parse(storedData);
      
      if (Array.isArray(parsedData)) {
        await saveToIDB('services', parsedData);
        console.log('Services data migrated to IndexedDB');
      }
    }
  } catch (error) {
    console.error('Error migrating services data:', error);
  }
};

export const migrateSalesData = async () => {
  try {
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') return;
    let storedData: string | null = null;
    try { storedData = localStorage.getItem('sales'); } catch (err) { storedData = null; }
    
    if (storedData) {
      const parsedData = JSON.parse(storedData);
      
      if (Array.isArray(parsedData)) {
        await saveToIDB('sales', parsedData);
        console.log('Sales data migrated to IndexedDB');
      }
    }
  } catch (error) {
    console.error('Error migrating sales data:', error);
  }
};

export const migrateAllData = async () => {
  await migrateStockData();
  await migrateAppointmentsData();
  await migrateCustomersData();
  await migrateServicesData();
  await migrateSalesData();
  console.log('All data migration completed');
};
