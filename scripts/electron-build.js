
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current directory in ESM context
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create a temporary package.json with correct dependency structure
console.log('Preparing package.json for Electron build...');
const packageJsonPath = path.join(__dirname, '..', 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

// Create a backup of the original package.json
const backupPath = path.join(__dirname, '..', 'package.json.backup');
fs.writeFileSync(backupPath, JSON.stringify(packageJson, null, 2));

// Move electron and electron-builder to devDependencies if they exist in dependencies
if (packageJson.dependencies && packageJson.dependencies.electron) {
  if (!packageJson.devDependencies) packageJson.devDependencies = {};
  packageJson.devDependencies.electron = packageJson.dependencies.electron;
  delete packageJson.dependencies.electron;
}

if (packageJson.dependencies && packageJson.dependencies['electron-builder']) {
  if (!packageJson.devDependencies) packageJson.devDependencies = {};
  packageJson.devDependencies['electron-builder'] = packageJson.dependencies['electron-builder'];
  delete packageJson.dependencies['electron-builder'];
}

// Add missing fields
if (!packageJson.description) {
  packageJson.description = "Beautiq Salon Yönetim Uygulaması";
}

if (!packageJson.author) {
  packageJson.author = {
    name: "Beautiq",
    email: "info@beautiq.com"
  };
}

// Set main entry point for Electron
packageJson.main = "index.js";

// Write the modified package.json
fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));

try {
  // Build React app
  console.log('Building React app...');
  execSync('npx vite build', { 
    stdio: 'inherit',
    env: { ...process.env, IS_ELECTRON: 'true' }
  });

  // Build Electron app
  console.log('Building Electron app...');
  execSync('npx electron-builder build --win', { stdio: 'inherit' });

  console.log('Build completed successfully!');
} catch (error) {
  console.error('Build failed:', error);
} finally {
  // Restore the original package.json
  console.log('Restoring original package.json...');
  fs.copyFileSync(backupPath, packageJsonPath);
  fs.unlinkSync(backupPath);
}
