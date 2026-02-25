#!/usr/bin/env node
/**
 * Gera ícones PWA (192x192 e 512x512) para o GestSilo.
 * Executar: node scripts/generate-pwa-icons.mjs
 */
import sharp from 'sharp';
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, '..', 'public');
const iconsDir = join(publicDir, 'icons');

const BRAND_COLOR = '#064e3b'; // brand-900
const EARTH_COLOR = '#22c55e';  // earth-500

async function createIcon(size) {
  const padding = Math.floor(size * 0.15);
  const innerSize = size - padding * 2;
  
  const svg = `
    <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="${BRAND_COLOR}" rx="${size * 0.2}"/>
      <circle cx="${size/2}" cy="${size/2}" r="${innerSize/2 - padding}" fill="${EARTH_COLOR}" opacity="0.9"/>
      <text x="50%" y="55%" text-anchor="middle" font-size="${size * 0.35}" font-weight="bold" fill="white" font-family="system-ui,sans-serif">G</text>
    </svg>
  `;
  
  return sharp(Buffer.from(svg))
    .png()
    .toBuffer();
}

async function main() {
  await mkdir(iconsDir, { recursive: true });
  
  const [icon192, icon512] = await Promise.all([
    createIcon(192),
    createIcon(512),
  ]);
  
  await Promise.all([
    writeFile(join(iconsDir, 'icon-192x192.png'), icon192),
    writeFile(join(iconsDir, 'icon-512x512.png'), icon512),
  ]);
  
  console.log('Ícones PWA gerados em public/icons/');
}

main().catch(console.error);
