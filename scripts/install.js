const { spawn } = require('child_process');
const fs = require('fs');

const logFile = fs.createWriteStream('./install.log', { flags: 'a' });

console.log('Starting npm install...');

const env = { ...process.env, CI: 'true', npm_config_loglevel: 'info' };

const child = spawn('npm', ['install', '--no-audit', '--progress=false', '--loglevel=info'], {
  stdio: ['ignore', 'pipe', 'pipe'],
  env
});

child.stdout.on('data', (data) => {
  const str = data.toString();
  process.stdout.write(str);
  logFile.write(str);
});

child.stderr.on('data', (data) => {
  const str = data.toString();
  process.stderr.write(str);
  logFile.write(str);
});

child.on('close', (code) => {
  console.log(`npm install finished with exit code ${code}`);
  logFile.end(`Finished with exit code ${code}\n`);
  process.exit(code);
});
