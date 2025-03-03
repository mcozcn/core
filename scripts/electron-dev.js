
import { spawn } from 'child_process';
import { platform } from 'os';

// Start Vite dev server
const vite = spawn('npm', ['run', 'dev'], { 
  shell: true,
  env: process.env,
  stdio: 'inherit'
});

// Wait for Vite to start before launching Electron
setTimeout(() => {
  // Start Electron
  const electron = spawn(
    platform() === 'win32' ? 'npx.cmd' : 'npx',
    ['electron', '.'],
    { shell: true, env: process.env, stdio: 'inherit' }
  );

  electron.on('close', (code) => {
    process.exit(code);
  });
}, 5000);

// Handle process termination
process.on('SIGINT', () => {
  vite.kill();
  process.exit(0);
});
