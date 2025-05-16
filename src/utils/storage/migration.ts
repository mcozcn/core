import { saveToIDB } from './idb';

export const migrateStockData = async () => {
  try {
    const storedData = localStorage.getItem('stock');
    
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
    const storedData = localStorage.getItem('appointments');
    
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
    const storedData = localStorage.getItem('customers');
    
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
    const storedData = localStorage.getItem('services');
    
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
    const storedData = localStorage.getItem('sales');
    
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
