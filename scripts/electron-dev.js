
import { spawn } from 'child_process';
import { platform } from 'os';

// Start Vite dev server
console.log('Starting Vite dev server...');
const vite = spawn('npm', ['run', 'dev'], { 
  shell: true,
  env: { ...process.env, IS_ELECTRON: 'true' },
  stdio: 'inherit'
});

// Wait for Vite to start before launching Electron
console.log('Waiting for Vite to start...');
setTimeout(() => {
  console.log('Starting Electron...');
  // Start Electron
  const electron = spawn(
    platform() === 'win32' ? 'npx.cmd' : 'npx',
    ['electron', '.'],
    { 
      shell: true, 
      env: { ...process.env, NODE_ENV: 'development', IS_ELECTRON: 'true' }, 
      stdio: 'inherit' 
    }
  );

  electron.on('close', (code) => {
    console.log(`Electron process exited with code ${code}`);
    process.exit(code);
  });
}, 5000);

// Handle process termination
process.on('SIGINT', () => {
  console.log('Process terminated');
  vite.kill();
  process.exit(0);
});
