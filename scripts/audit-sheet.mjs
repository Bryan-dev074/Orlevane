/**
 * Hoja de control para revisar a tamaño legible si alguna fotografía deja ver
 * el logotipo del fabricante original. Uso:
 *   node scripts/audit-sheet.mjs <carpeta-salida> <nombre> <archivo...>
 */
import sharp from 'sharp';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const [outDir, name, ...files] = process.argv.slice(2);

const COLS = 3;
const CW = 620;
const CH = 775;
const rows = Math.ceil(files.length / COLS);

const cells = [];
for (let i = 0; i < files.length; i++) {
  const buf = await sharp(path.join(ROOT, 'public', 'media', files[i]))
    .resize(CW, CH, { fit: 'cover' })
    .toBuffer();
  cells.push({ input: buf, left: (i % COLS) * CW, top: Math.floor(i / COLS) * CH });
  const label = `<svg xmlns="http://www.w3.org/2000/svg" width="${CW}" height="34"><rect width="${CW}" height="34" fill="#000"/><text x="10" y="24" font-family="monospace" font-size="20" fill="#7CFF7C">${files[i]}</text></svg>`;
  cells.push({
    input: Buffer.from(label),
    left: (i % COLS) * CW,
    top: Math.floor(i / COLS) * CH + CH - 34,
  });
}

await sharp({ create: { width: COLS * CW, height: rows * CH, channels: 3, background: '#1a1a1a' } })
  .composite(cells)
  .jpeg({ quality: 90 })
  .toFile(path.join(outDir, `${name}.jpg`));

console.log('ok', name, files.length);
