
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

// Add description if not present
if (!packageJson.description) {
  packageJson.description = "Beautiq Salon Yönetim Uygulaması";
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

  // Copy index.js to dist
  console.log('Copying index.js to root directory...');
  const sourcePath = path.join(__dirname, '..', 'index.js');
  const destPath = path.join(__dirname, '..', 'dist', 'index.js');
  fs.copyFileSync(sourcePath, destPath);

  // Copy electron directory to dist
  console.log('Copying electron directory to dist...');
  const electronDir = path.join(__dirname, '..', 'electron');
  const distElectronDir = path.join(__dirname, '..', 'dist', 'electron');
  
  if (!fs.existsSync(distElectronDir)) {
    fs.mkdirSync(distElectronDir, { recursive: true });
  }
  
  fs.readdirSync(electronDir).forEach(file => {
    fs.copyFileSync(
      path.join(electronDir, file),
      path.join(distElectronDir, file)
    );
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
