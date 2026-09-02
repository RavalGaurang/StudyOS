const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const frontendNext = path.join(rootDir, 'frontend', '.next');
const rootNext = path.join(rootDir, '.next');
const frontendPublic = path.join(rootDir, 'frontend', 'public');
const rootPublic = path.join(rootDir, 'public');

// 1. Mirror .next to root
if (fs.existsSync(frontendNext)) {
  try {
    fs.cpSync(frontendNext, rootNext, { recursive: true });
    console.log('✅ Mirrored frontend/.next to root .next for Vercel');
  } catch (err) {
    console.error('Mirror .next warning:', err.message);
  }
}

// 2. Mirror public to root
if (fs.existsSync(frontendPublic)) {
  try {
    fs.cpSync(frontendPublic, rootPublic, { recursive: true });
    console.log('✅ Mirrored frontend/public to root public for Vercel');
  } catch (err) {
    console.error('Mirror public warning:', err.message);
  }
}
