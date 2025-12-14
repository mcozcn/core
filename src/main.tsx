
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { AuthProvider } from '@/contexts/AuthContext';
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
    // Ensure clipboard API doesn't cause unhandled exceptions in restricted contexts
    try {
      if (typeof navigator !== 'undefined') {
        const navAny: any = navigator as any;
        if (!navAny.clipboard || typeof navAny.clipboard.writeText !== 'function') {
          navAny.clipboard = navAny.clipboard || {};
          navAny.clipboard.writeText = async (_text: string) => {
            return Promise.reject(new Error('clipboard.writeText is not available in this context'));
          };
        }
      }
    } catch (err) {
      console.warn('Clipboard polyfill failed or is not allowed:', err);
    }
    // Global error handlers to catch unhandled rejections (e.g. clipboard errors) and prevent crashes
    const onUnhandledRejection = (e: PromiseRejectionEvent) => {
      console.warn('Unhandled promise rejection caught:', e.reason);
      // Prevent default to avoid noisy DevTools messages
      // but do not swallow silently in production - log to monitoring if configured
      // e.preventDefault && e.preventDefault();
    };

    const onWindowError = (e: ErrorEvent) => {
      console.warn('Window error caught:', e.message, e.error);
    };

    window.addEventListener('unhandledrejection', onUnhandledRejection);
    window.addEventListener('error', onWindowError);

    return () => {
      window.removeEventListener('unhandledrejection', onUnhandledRejection);
      window.removeEventListener('error', onWindowError);
    };
  }, []);

  return (
    <AuthProvider>
      <App />
    </AuthProvider>
  );
};

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AppWithStorage />
  </React.StrictMode>
);
