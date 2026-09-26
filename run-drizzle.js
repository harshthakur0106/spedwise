const fs = require('fs');
const { execFileSync } = require('child_process');

const envText = fs.readFileSync('.env.local', 'utf8');
for (const line of envText.split(/\r?\n/)) {
  const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)=(.*)\s*$/);
  if (match) {
    process.env[match[1]] = match[2].replace(/^"|"$/g, '');
  }
}

execFileSync('npx', ['drizzle-kit', 'push'], {
  stdio: 'inherit',
  env: process.env,
  shell: true,
});
