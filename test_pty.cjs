const pty = require('node-pty');
const os = require('os');
const isWin = os.platform() === 'win32';
const shell = isWin ? 'cmd.exe' : 'bash';
const fullCmd = 'echo HELLO_FROM_CMD';
const shellArgs = isWin ? ['/d', '/s', '/c', '\"' + fullCmd + '\"'] : ['-lc', fullCmd];
console.log('Spawning:', shell, shellArgs);
try {
  const p = pty.spawn(shell, shellArgs, { name: 'xterm-color', cols: 80, rows: 24, cwd: process.cwd(), env: process.env });
  p.onData(data => console.log('DATA:', data));
  p.onExit(e => console.log('EXIT:', e));
} catch(err) {
  console.error('SPAWN ERROR:', err);
}
