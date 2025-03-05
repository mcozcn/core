
// Entry point for Electron app
import { app } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Get current directory in ESM context
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Import the main process file directly
import('./electron/main.js').catch(err => {
  console.error('Error importing main process file:', err);
  app.quit();
});
