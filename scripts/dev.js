import { spawn } from 'node:child_process';
import http from 'node:http';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const electronPath = require('electron');

console.log('🚀 Starting Robent development environment...');
const vite = spawn('npx', ['vite', '--port', '1420'], {
  cwd: process.cwd(),
  stdio: 'inherit',
  shell: true,
  env: process.env,
});

let electronStarted = false;
function checkViteReady(retries = 40) {
  if (retries <= 0) {
    console.error('❌ Vite dev server timed out.');
    try { vite.kill(); } catch (e) {}
    process.exit(1);
  }
  http.get('http://localhost:1420', () => {
    if (!electronStarted) {
      electronStarted = true;
      console.log('💻 Launching Robent Desktop App...');
      const electronApp = spawn(electronPath, ['.', '--no-sandbox'], {
        cwd: process.cwd(),
        stdio: 'inherit',
        env: {
          ...process.env,
          VITE_DEV_SERVER_URL: 'http://localhost:1420',
        },
      });
      electronApp.on('exit', (code) => {
        console.log('Robent Desktop closed.');
        try { vite.kill(); } catch (e) {}
        process.exit(code || 0);
      });
    }
  }).on('error', () => {
    setTimeout(() => checkViteReady(retries - 1), 300);
  });
}

setTimeout(() => checkViteReady(), 600);

process.on('SIGINT', () => {
  try { vite.kill(); } catch (e) {}
  process.exit(0);
});
process.on('SIGTERM', () => {
  try { vite.kill(); } catch (e) {}
  process.exit(0);
});
