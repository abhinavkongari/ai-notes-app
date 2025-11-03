import sharp from 'sharp';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const svgIcon = `
<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <!-- Background -->
  <rect width="512" height="512" fill="#3b82f6" rx="80"/>

  <!-- Note paper icon -->
  <g>
    <!-- Paper background -->
    <rect x="128" y="96" width="256" height="320" fill="#ffffff" rx="12"/>

    <!-- Lines representing text -->
    <line x1="168" y1="156" x2="344" y2="156" stroke="#e5e7eb" stroke-width="8" stroke-linecap="round"/>
    <line x1="168" y1="196" x2="344" y2="196" stroke="#e5e7eb" stroke-width="8" stroke-linecap="round"/>
    <line x1="168" y1="236" x2="308" y2="236" stroke="#e5e7eb" stroke-width="8" stroke-linecap="round"/>

    <!-- AI sparkle symbol -->
    <g transform="translate(168, 276)">
      <circle cx="0" cy="0" r="6" fill="#3b82f6"/>
      <line x1="-15" y1="0" x2="15" y2="0" stroke="#3b82f6" stroke-width="4" stroke-linecap="round"/>
      <line x1="0" y1="-15" x2="0" y2="15" stroke="#3b82f6" stroke-width="4" stroke-linecap="round"/>
      <line x1="-10" y1="-10" x2="10" y2="10" stroke="#3b82f6" stroke-width="3" stroke-linecap="round"/>
      <line x1="10" y1="-10" x2="-10" y2="10" stroke="#3b82f6" stroke-width="3" stroke-linecap="round"/>
    </g>

    <!-- More lines -->
    <line x1="208" y1="296" x2="344" y2="296" stroke="#e5e7eb" stroke-width="8" stroke-linecap="round"/>
    <line x1="168" y1="336" x2="344" y2="336" stroke="#e5e7eb" stroke-width="8" stroke-linecap="round"/>
  </g>
</svg>
`;

async function generateIcons() {
  const publicDir = join(__dirname, '..', 'public');

  console.log('Generating PWA icons...');

  // Generate 192x192
  await sharp(Buffer.from(svgIcon))
    .resize(192, 192)
    .png()
    .toFile(join(publicDir, 'icon-192.png'));

  console.log('✓ Generated icon-192.png');

  // Generate 512x512
  await sharp(Buffer.from(svgIcon))
    .resize(512, 512)
    .png()
    .toFile(join(publicDir, 'icon-512.png'));

  console.log('✓ Generated icon-512.png');

  console.log('\nPWA icons generated successfully!');
}

generateIcons().catch(console.error);
