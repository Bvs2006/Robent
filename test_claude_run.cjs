const pty = require('node-pty');
try {
  const p = pty.spawn('cmd.exe', ['/c', 'claude -p "Say hello and stop" --dangerously-skip-permissions'], { name: 'xterm-color', cols: 80, rows: 24, cwd: process.cwd(), env: process.env });
  p.onData(data => console.log('DATA:', data));
  p.onExit(e => console.log('EXIT:', e));
} catch(err) {
  console.error('SPAWN ERROR:', err);
}
