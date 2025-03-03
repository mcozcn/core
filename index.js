
// Entry point for Electron app
import { app } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Get current directory in ESM context
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Set app path
if (process.env.NODE_ENV === 'development') {
  // In development, use the source files
  import('./electron/main.js');
} else {
  // In production, use the built files
  process.env.DIST = path.join(__dirname, './dist');
  process.env.PUBLIC = app.isPackaged ? process.env.DIST : path.join(__dirname, './public');
  import('./electron/main.js');
}
