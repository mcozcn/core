
// Entry point for Electron app
const { app } = require('electron');
const path = require('path');

// Set app path
if (process.env.NODE_ENV === 'development') {
  // In development, use the source files
  require('./electron/main');
} else {
  // In production, use the built files
  process.env.DIST = path.join(__dirname, './dist');
  process.env.PUBLIC = app.isPackaged ? process.env.DIST : path.join(__dirname, './public');
  require('./electron/main');
}
