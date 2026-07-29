/**
 * Genera public/og.jpg (1200×630) a partir de una fotografía de la colección
 * más la marca. Se ejecuta a mano: node scripts/make-og.mjs
 */
import sharp from 'sharp';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const W = 1200;
const H = 630;

const base = await sharp(path.join(ROOT, 'public', 'media', 'p', 'aurore-1.webp'))
  .resize(W, H, { fit: 'cover', position: 'centre' })
  .modulate({ brightness: 0.86 })
  .toBuffer();

const veil = Buffer.from(
  `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
     <defs>
       <linearGradient id="g" x1="0" y1="0" x2="1" y2="0">
         <stop offset="0%" stop-color="#171411" stop-opacity="0.97"/>
         <stop offset="52%" stop-color="#171411" stop-opacity="0.72"/>
         <stop offset="100%" stop-color="#171411" stop-opacity="0.12"/>
       </linearGradient>
     </defs>
     <rect width="${W}" height="${H}" fill="url(#g)"/>
   </svg>`,
);

const type = Buffer.from(
  `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
     <g font-family="Didot, 'Bodoni MT', Georgia, serif" fill="#F4EFE6">
       <text x="86" y="250" font-size="88" letter-spacing="26">ORLÉVANE</text>
       <text x="90" y="322" font-size="34" font-style="italic" fill="#F4EFE6" opacity="0.82">Elegancia en cada paso.</text>
     </g>
     <rect x="90" y="366" width="150" height="2" fill="#B89A5B"/>
     <g font-family="Jost, Futura, 'Century Gothic', sans-serif" fill="#B89A5B">
       <text x="90" y="422" font-size="21" letter-spacing="6">CASA DE CALZADO · ASUNCIÓN</text>
     </g>
     <g font-family="Jost, Futura, 'Century Gothic', sans-serif" fill="#F4EFE6" opacity="0.5">
       <text x="90" y="468" font-size="18" letter-spacing="4">TIENDA DE DEMOSTRACIÓN</text>
     </g>
   </svg>`,
);

await sharp(base)
  .composite([
    { input: veil, blend: 'over' },
    { input: type, blend: 'over' },
  ])
  .jpeg({ quality: 88, mozjpeg: true })
  .toFile(path.join(ROOT, 'public', 'og.jpg'));

console.log('public/og.jpg listo');
