
import { app, BrowserWindow } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import isDev from 'electron-is-dev';

// Get current directory in ESM context
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let mainWindow;

function createWindow() {
  console.log('Creating main window with dirname:', __dirname);
  
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    show: false, // Don't show until loaded
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      webSecurity: false // Disable web security for development only
    }
  });

  // Load the app
  const startUrl = isDev 
    ? 'http://localhost:8080' // Dev server
    : `file://${path.resolve(__dirname, '../dist/index.html')}`; // Production build using resolve
  
  console.log('Loading URL:', startUrl);
  
  // Add error handling for page loading
  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    console.error('Failed to load:', errorCode, errorDescription);
    
    // Try different paths if in production and failed to load
    if (!isDev) {
      console.log('Attempting to load alternative paths...');
      
      // Try alternative paths
      const alternativePaths = [
        path.resolve(__dirname, '../dist/index.html'),
        path.resolve(__dirname, './dist/index.html'),
        path.resolve(__dirname, 'dist/index.html'),
        path.resolve(__dirname, '../index.html'),
        path.resolve(__dirname, './index.html'),
        path.join(__dirname, '../dist/index.html'),
        path.join(__dirname, './dist/index.html'),
        path.join(__dirname, 'dist/index.html')
      ];
      
      // Log all paths we're trying
      console.log('Trying alternative paths:', alternativePaths);
      
      // Try the first alternative path
      mainWindow.loadFile(alternativePaths[0]);
    }
  });
  
  mainWindow.loadURL(startUrl);

  // Open DevTools in development mode
  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  // Show when ready
  mainWindow.webContents.on('did-finish-load', () => {
    console.log('Window loaded successfully');
    mainWindow.show();
  });

  // Remove window when closed
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Create window when Electron is ready
app.whenReady().then(() => {
  console.log('Electron app is ready');
  createWindow();
});

// Quit when all windows are closed
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// Handle any uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught exception:', error);
});
