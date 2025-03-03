
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current directory in ESM context
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Build React app
console.log('Building React app...');
execSync('npm run build', { stdio: 'inherit' });

// Build Electron app
console.log('Building Electron app...');
execSync('npx electron-builder build --win', { stdio: 'inherit' });

console.log('Build completed successfully!');
