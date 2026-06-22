const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const destination = path.join(root, 'www');
const files = [
  'index.html',
  'occurrence.html',
  'finalize.html',
  'history.html',
  'grades.html',
  'login.html',
  'settings.html',
  'privacy.html',
  'app.js',
  'styles.css',
  'offline-store.js',
  'handwriting.js',
  'manifest.webmanifest',
  'service-worker.js',
];
const directories = ['icons'];

fs.rmSync(destination, { recursive: true, force: true });
fs.mkdirSync(destination, { recursive: true });

for (const relativePath of files) {
  fs.copyFileSync(path.join(root, relativePath), path.join(destination, relativePath));
}

for (const relativePath of directories) {
  fs.cpSync(path.join(root, relativePath), path.join(destination, relativePath), { recursive: true });
}

console.log(`Assets web preparados em ${destination}`);
