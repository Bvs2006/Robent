const pty = require('node-pty');
const os = require('os');
function quoteArg(arg) {
  if (!/[\s&<>|^()"]/.test(arg)) return arg;
  return '\"' + arg.replace(/\"/g, '\\\"') + '\"';
}
const command = 'echo';
const args = ['HELLO WORLD'];
const fullCmd = [command, ...args.map(quoteArg)].join(' ');
const shellArgs = ['/d', '/c', fullCmd];
console.log('shellArgs:', shellArgs);
const p = pty.spawn('cmd.exe', shellArgs, { name: 'xterm-color', cols: 80, rows: 24, cwd: process.cwd(), env: process.env });
p.onData(d => console.log('DATA:', d));
p.onExit(e => console.log('EXIT:', e));
