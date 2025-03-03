
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Build React app
console.log('Building React app...');
execSync('npm run build', { stdio: 'inherit' });

// Build Electron app
console.log('Building Electron app...');
execSync('npx electron-builder build --win', { stdio: 'inherit' });

console.log('Build completed successfully!');
