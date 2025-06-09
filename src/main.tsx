
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { migrateLocalStorageToIDB } from './utils/storage/idb';
import { checkMigrationNeeded, runMigrations } from './utils/storage/migration';

// Wrapper component to handle IndexedDB initialization
const AppWithStorage = () => {
  React.useEffect(() => {
    // Initialize storage and run migrations when app starts
    const initializeStorage = async () => {
      try {
        // Check if data migration is needed
        const needsMigration = await checkMigrationNeeded();
        if (needsMigration) {
          console.log('Data migration needed');
          await runMigrations();
        }
        
        // Migrate existing data from localStorage to IndexedDB
        await migrateLocalStorageToIDB();
        console.log('Storage initialization completed');
      } catch (error) {
        console.error('Error initializing storage:', error);
      }
    };

    initializeStorage();
  }, []);

  return <App />;
};

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AppWithStorage />
  </React.StrictMode>
);
