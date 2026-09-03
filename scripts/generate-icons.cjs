// Reuse the platform's actual Lucide logo, rather than a separate drawing.
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const { Dumbbell } = require('lucide-react');
const sharp = require('sharp');
const fs = require('node:fs/promises');
const path = require('node:path');

async function main() {
  const logo = renderToStaticMarkup(React.createElement(Dumbbell, {
    x: 112, y: 112, width: 288, height: 288,
    color: '#26d7c6', strokeWidth: 1.5,
  }));
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512"><rect width="512" height="512" fill="#091214"/>${logo}</svg>`;
  const publicDir = path.join(__dirname, '..', 'public');
  await fs.writeFile(path.join(publicDir, 'favicon.svg'), svg + '\n');
  for (const [name, size] of [
    ['apple-touch-icon.png', 180],
    ['icon-192.png', 192],
    ['icon-512.png', 512],
  ]) {
    await sharp(Buffer.from(svg)).resize(size, size).png().toFile(path.join(publicDir, name));
  }
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
