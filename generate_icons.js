const fs = require('fs');
const path = require('path');

// Generiše jednostavan PNG za ikone (minimalan 1x1 base64 transparent/neon png)
// ili kreiramo SVG ikonu i fallback
const svgIcon = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <rect width="512" height="512" fill="#000000" rx="90"/>
  <circle cx="256" cy="256" r="220" stroke="#ff00de" stroke-width="12" fill="none" filter="drop-shadow(0 0 20px #ff00de)"/>
  <circle cx="256" cy="256" r="170" stroke="#00ffff" stroke-width="8" fill="none"/>
  <text x="256" y="320" font-family="sans-serif" font-weight="900" font-size="200" text-anchor="middle" fill="#ffffff" stroke="#ff00de" stroke-width="6">777</text>
</svg>
`;

fs.writeFileSync(path.join(__dirname, 'assets', 'icons', 'icon.svg'), svgIcon.trim());

// Kreiramo i dummy 192 i 512 png (1x1 pixel PNG raw buffer) da manifest ne prijavljuje 404
const dummyPngBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';
const buf = Buffer.from(dummyPngBase64, 'base64');
fs.writeFileSync(path.join(__dirname, 'assets', 'icons', 'icon-192.png'), buf);
fs.writeFileSync(path.join(__dirname, 'assets', 'icons', 'icon-512.png'), buf);

console.log('PWA ikone kreirane uspešno.');
