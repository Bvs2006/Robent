import { spawn, execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const electronPath = require('electron');

// Fix 16: Kill stale electron processes before launching (Windows only)
if (process.platform === 'win32') {
  try {
    execSync('taskkill /F /IM electron.exe', { stdio: 'ignore' });
  } catch {
    // Ignore error if no electron processes are running
  }
}

// Fix 19: Kill Vite process tree on Windows
function killProcessTree(proc) {
  if (!proc || !proc.pid) return;
  if (process.platform === 'win32') {
    try {
      execSync('taskkill /PID ' + proc.pid + ' /T /F', { stdio: 'ignore' });
    } catch {
      // Process may have already exited
    }
  } else {
    try {
      proc.kill();
    } catch {
      // Process may have already exited
    }
  }
}

console.log('🚀 Starting Robent development environment...');
const vite = spawn('npx', ['vite', '--port', '1420'], {
  cwd: process.cwd(),
  stdio: ['inherit', 'pipe', 'inherit'],
  shell: true,
  env: {
    ...process.env,
    ELECTRON_STARTUP_PREVENT: 'true',
  },
});

let detectedPort = null;
let electronStarted = false;
let checkTimer = null;
let stdoutBuffer = '';

// Fix 18: Detect actual Vite port from stdout
vite.stdout.on('data', (data) => {
  process.stdout.write(data);
  if (!detectedPort) {
    stdoutBuffer += data.toString();
    // eslint-disable-next-line no-control-regex
    const clean = stdoutBuffer.replace(/\x1B\[[0-9;]*[a-zA-Z]/g, '');
    const match = clean.match(/Local:\s+http:\/\/localhost:(\d+)\//);
    if (match) {
      detectedPort = parseInt(match[1], 10);
      checkViteReady(detectedPort);
    }
  }
});

vite.on('exit', (code) => {
  if (!electronStarted) {
    console.error(`❌ Vite process exited with code ${code}`);
    process.exit(code || 1);
  }
});

// Check Vite HTTP readiness
function checkViteReady(port, retries = 60) {
  if (electronStarted) return;
  if (retries <= 0) {
    console.error('❌ Vite dev server timed out.');
    killProcessTree(vite);
    process.exit(1);
  }

  const req = http.get(`http://localhost:${port}`, (res) => {
    res.resume();
    if (checkTimer) clearTimeout(checkTimer);
    // Fix 17: Wait for dist-electron/main.js before spawning Electron
    waitForMainBuild(port);
  });

  req.on('error', () => {
    if (!electronStarted) {
      checkTimer = setTimeout(() => checkViteReady(port, retries - 1), 500);
    }
  });
}

const startTime = Date.now() - 1000;

// Fix 17: Poll for fresh, fully-written dist-electron bundles
function waitForMainBuild(port, retries = 50) {
  if (electronStarted) return;

  const mainPath = path.join(process.cwd(), 'dist-electron', 'main.js');
  const preloadPath = path.join(process.cwd(), 'dist-electron', 'preload.mjs');

  try {
    if (fs.existsSync(mainPath) && fs.existsSync(preloadPath)) {
      const mainStat = fs.statSync(mainPath);
      const preloadStat = fs.statSync(preloadPath);
      if (mainStat.size > 1000 && preloadStat.size > 500 && mainStat.mtimeMs >= startTime) {
        // Give 250ms for file handle release/disk flush
        setTimeout(() => launchElectron(port), 250);
        return;
      }
    }
  } catch {
    // File may be locked while being written
  }

  if (retries <= 0) {
    console.error('❌ dist-electron/main.js build timed out.');
    killProcessTree(vite);
    process.exit(1);
  }

  setTimeout(() => waitForMainBuild(port, retries - 1), 300);
}

function launchElectron(port) {
  if (electronStarted) return;
  electronStarted = true;

  console.log('💻 Launching Robent Desktop App...');
  const electronApp = spawn(electronPath, ['.', '--no-sandbox'], {
    cwd: process.cwd(),
    stdio: 'inherit',
    env: {
      ...process.env,
      VITE_DEV_SERVER_URL: `http://localhost:${port}`,
    },
  });

  electronApp.on('exit', (code) => {
    console.log('Robent Desktop closed.');
    killProcessTree(vite);
    process.exit(code || 0);
  });
}

process.on('SIGINT', () => {
  killProcessTree(vite);
  process.exit(0);
});

process.on('SIGTERM', () => {
  killProcessTree(vite);
  process.exit(0);
});
