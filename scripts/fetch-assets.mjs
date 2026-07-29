/**
 * ORLÉVANE — pipeline de assets.
 *
 * Descarga la fotografía de referencia (Unsplash License), genera los recortes
 * 4:5 de ficha, los "detalle" (zoom real sobre el mismo negativo) y los planos
 * editoriales, y escribe src/lib/blur.generated.ts con los placeholders LQIP.
 *
 * Uso:  node scripts/fetch-assets.mjs
 *
 * Las fotografías son material de demostración. Reemplazar por producción
 * propia antes de cualquier uso comercial.
 */
import sharp from 'sharp';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'public', 'media');

/** [id, salida, modo]  modo: 'p' ficha 4:5 · 'd' detalle 4:5 · 'e' editorial 3:2 · 'v' editorial vertical 2:3 */
const MANIFEST = [
  // ── MUJER ───────────────────────────────────────────────────────────────
  ['photo-1596703263926-eb0762ee17e4', 'p/vesper-1', 'p'],
  ['photo-1596703263926-eb0762ee17e4', 'p/vesper-2', 'd'],
  ['photo-1784821926336-e72c5d3d2bf0', 'p/aurore-1', 'p'],
  ['photo-1784821926273-729302e327a7', 'p/aurore-2', 'p'],
  ['photo-1613987876445-fcb353cd8e27', 'p/sanguine-1', 'p'],
  ['photo-1611233299310-f6276ff55307', 'p/sanguine-2', 'p'],
  ['photo-1553545985-1e0d8781d5db', 'p/lumiere-1', 'p'],
  ['photo-1553545985-1e0d8781d5db', 'p/lumiere-2', 'd'],
  ['photo-1614634717465-eb3d6bc8d930', 'p/blanche-1', 'p'],
  ['photo-1614634717465-eb3d6bc8d930', 'p/blanche-2', 'd'],
  ['photo-1770757685173-94df47a52b68', 'p/cadence-1', 'p'],
  ['photo-1619510331283-a46c425e48bb', 'p/cadence-2', 'p'],
  ['photo-1712512343634-f64161d3daa6', 'p/solene-1', 'p'],
  ['photo-1604136172384-b2e9c43271ec', 'p/solene-2', 'p'],
  ['photo-1682987228796-cdc66c167dcd', 'p/seraphine-1', 'p'],
  ['photo-1755561491248-2549333dd803', 'p/seraphine-2', 'p'],
  ['photo-1763661300203-aa3e2702f510', 'p/mireille-1', 'p'],
  ['photo-1633276664211-bd59ef0f2d06', 'p/mireille-2', 'p'],
  ['photo-1621996659490-3275b4d0d951', 'p/verona-1', 'p'],
  ['photo-1621996659490-3275b4d0d951', 'p/verona-2', 'd'],
  ['photo-1531310197839-ccf54634509e', 'p/fauve-1', 'p'],
  ['photo-1531310197839-ccf54634509e', 'p/fauve-2', 'd'],
  ['photo-1600429316815-43fe937fdc92', 'p/rebelle-1', 'p'],
  ['photo-1600429316815-43fe937fdc92', 'p/rebelle-2', 'd'],
  ['photo-1618919308039-bd644f0eea12', 'p/nocturne-1', 'p'],
  ['photo-1627141792925-eddee39cf275', 'p/nocturne-2', 'p'],

  // ── HOMBRE ──────────────────────────────────────────────────────────────
  ['photo-1634304138376-43a922e96c80', 'p/ravel-1', 'p'],
  ['photo-1634304138376-43a922e96c80', 'p/ravel-2', 'd'],
  ['photo-1603796847227-9183fd69e884', 'p/montaigne-1', 'p'],
  ['photo-1603796847227-9183fd69e884', 'p/montaigne-2', 'd'],
  ['photo-1557673862-a2a470406a30', 'p/bristol-1', 'p'],
  ['photo-1549290127-7f758fdadff7', 'p/bristol-2', 'p'],
  ['photo-1777987601447-266e128de448', 'p/havana-1', 'p'],
  ['photo-1777987601447-266e128de448', 'p/havana-2', 'd'],
  ['photo-1760616172899-0681b97a2de3', 'p/onyx-1', 'p'],
  ['photo-1615979474401-8a6a344de5bd', 'p/onyx-2', 'p'],
  ['photo-1711356240240-2516c04b3585', 'p/etrier-1', 'p'],
  ['photo-1649503377051-e092f490c482', 'p/etrier-2', 'p'],
  ['photo-1655102671475-89a76d271d5f', 'p/vannerie-1', 'p'],
  ['photo-1655102671475-89a76d271d5f', 'p/vannerie-2', 'd'],
  ['photo-1777987601677-3059be0e1388', 'p/vinci-1', 'p'],
  ['photo-1777987601423-f350ac29b3e9', 'p/vinci-2', 'p'],
  ['photo-1577387280394-12fd9389ac86', 'p/sierra-1', 'p'],
  ['photo-1536267650249-e4a774bea228', 'p/sierra-2', 'p'],
  ['photo-1775903961719-af9e79063146', 'p/meridien-1', 'p'],
  ['photo-1775903961719-af9e79063146', 'p/meridien-2', 'd'],
  ['photo-1657034321685-1fba1b2751f3', 'p/sartor-1', 'p'],
  ['photo-1772678144516-4fddf7635ab4', 'p/sartor-2', 'p'],
  ['photo-1608379743498-ac08f6d022ba', 'p/atelier-blanc-1', 'p'],
  ['photo-1608379743498-ac08f6d022ba', 'p/atelier-blanc-2', 'd'],
  ['photo-1620989928625-08536e746255', 'p/creme-1', 'p'],
  ['photo-1620989928625-08536e746255', 'p/creme-2', 'd'],

  // ── ACCESORIOS ──────────────────────────────────────────────────────────
  ['photo-1752386223406-b3d94092d790', 'p/sillar-1', 'p'],
  ['photo-1752386223406-b3d94092d790', 'p/sillar-2', 'd'],
  ['photo-1752386268324-0533ffbfbc0e', 'p/cinta-1', 'p'],
  ['photo-1752386268324-0533ffbfbc0e', 'p/cinta-2', 'd'],
  ['photo-1575032617751-6ddec2089882', 'p/nanduti-bag-1', 'p'],
  ['photo-1575032617751-6ddec2089882', 'p/nanduti-bag-2', 'd'],
  ['photo-1614179689702-355944cd0918', 'p/tote-noir-1', 'p'],
  ['photo-1614179689702-355944cd0918', 'p/tote-noir-2', 'd'],
  ['photo-1691480150204-66dd1eb77391', 'p/cognac-bag-1', 'p'],
  ['photo-1691480150204-66dd1eb77391', 'p/cognac-bag-2', 'd'],
  ['photo-1682745230951-8a5aa9a474a0', 'p/ivoire-bag-1', 'p'],
  ['photo-1606522754091-a3bbf9ad4cb3', 'p/ivoire-bag-2', 'p'],
  ['photo-1628483211662-9bcc692c46dc', 'p/portefeuille-1', 'p'],
  ['photo-1614330316074-769a15d75d01', 'p/portefeuille-2', 'p'],
  ['photo-1614330315526-166f2d71e544', 'p/compacta-1', 'p'],
  ['photo-1614260937560-c749cc17da94', 'p/compacta-2', 'p'],
  ['photo-1577467014911-2c66a5c1995a', 'p/estuche-1', 'p'],
  ['photo-1577466802006-5a3e6df84516', 'p/estuche-2', 'p'],
  ['photo-1577467013301-3cfafe7079a3', 'p/crin-1', 'p'],
  ['photo-1577467014381-aa7c13dbf331', 'p/crin-2', 'p'],

  // ── EDITORIAL ───────────────────────────────────────────────────────────
  ['photo-1477517787936-70ba786643fd', 'e/atelier-horma', 'e'],
  ['photo-1777177967028-bd91fe0954a0', 'e/atelier-banco', 'e'],
  ['photo-1597318404273-4dfde9917a01', 'e/atelier-costura', 'e'],
  ['photo-1648343615199-03567050abbb', 'e/atelier-mesa', 'e'],
  ['photo-1759523069474-3c45494a6679', 'e/atelier-herramientas', 'e'],
  ['photo-1764391787393-d700b3afce8e', 'e/atelier-lustre', 'e'],
  ['photo-1637868796504-32f45a96d5a0', 'e/bodegon-cuero', 'e'],
  ['photo-1563112643-5b286536a949', 'e/campana-nocturne', 'v'],
  ['photo-1596883540988-16ff5d2a157e', 'e/campana-sombra', 'v'],
  ['photo-1630837906220-bb42d297c9e9', 'e/campana-sastre', 'v'],
  ['photo-1630837406101-e3ccd9464fdd', 'e/campana-salon', 'e'],
  ['photo-1575403538007-acb790100421', 'e/campana-piel', 'e'],
  ['photo-1653868250562-576619bb2ad6', 'e/cuidado-mesa', 'e'],
  ['photo-1552256028-71eb9a7ff27d', 'e/boutique-calle', 'v'],

  // ── TRÍO DE MUNDOS EN PORTADA ──────────────────────────────────────────
  // Mismo registro los tres: una sola pieza, fondo claro, sombra blanda.
  // Es lo que hace que se lean como una campaña y no como tres fotos sueltas.
  ['photo-1621996659490-3275b4d0d951', 'c/mundo-mujer', 'c'],
  ['photo-1711356240240-2516c04b3585', 'c/mundo-hombre', 'c'],
  ['photo-1691480150204-66dd1eb77391', 'c/mundo-accesorios', 'c'],

  // ── BOUTIQUES ──────────────────────────────────────────────────────────
  // Una tarjeta de boutique tiene que mostrar el local. Los tres interiores
  // van en el mismo registro: luz baja, madera, latón.
  ['photo-1771775529036-2a9dc65ca54b', 'c/boutique-villa-morra', 'c'],
  ['photo-1782834294705-88a8559c2109', 'c/boutique-cde', 'c'],
  ['photo-1648343615199-03567050abbb', 'c/boutique-taller', 'c'],

  // ── VITRINA DE PORTADA (a sangre, hace falta el doble de píxel) ─────────
  ['photo-1784821926336-e72c5d3d2bf0', 'h/aurore', 'h'],
  ['photo-1777987601677-3059be0e1388', 'h/vinci', 'h'],
  ['photo-1575032617751-6ddec2089882', 'h/nanduti-bag', 'h'],

  // ── PIEZA WEBGL (se muestrea en el cliente) ─────────────────────────────
  ['photo-1562687848-c1664eff566d', 'w/particula', 'p'],
];

/**
 * Retoque de marcas ajenas.
 *
 * La fotografía de referencia muestra calzado y marroquinería de otras casas, y
 * algunas piezas llevan el logotipo del fabricante a la vista. En una tienda que
 * dice ser ORLÉVANE eso es un error de bulto, así que las marcas se difuminan.
 * Los rectángulos van normalizados (0–1) sobre la imagen ya recortada, y siempre
 * caen sobre superficie lisa, donde el parche no deja costura.
 */
const RETOUCH = {
  'p/tote-noir-1': [[0.43, 0.695, 0.2, 0.07]], // grabado centrado en la solapa
  'p/tote-noir-2': [[0.36, 0.5, 0.3, 0.12]],
  'p/ivoire-bag-2': [[0.5, 0.61, 0.22, 0.07]], // grabado bajo el cierre
  'p/compacta-1': [[0.51, 0.59, 0.26, 0.08]], // grabado en la tapa
  'p/compacta-2': [[0.4, 0.5, 0.34, 0.14]],
};

async function retouch(buf, marks, w, h) {
  let out = sharp(buf);
  const patches = [];
  for (const [nx, ny, nw, nh] of marks) {
    const left = Math.max(0, Math.round(nx * w));
    const top = Math.max(0, Math.round(ny * h));
    const width = Math.min(w - left, Math.round(nw * w));
    const height = Math.min(h - top, Math.round(nh * h));
    if (width < 4 || height < 4) continue;
    const patch = await sharp(buf)
      .extract({ left, top, width, height })
      .blur(Math.max(6, Math.min(width, height) / 3))
      .toBuffer();
    patches.push({ input: patch, left, top });
  }
  if (patches.length) out = out.composite(patches);
  return out.toBuffer();
}

/**
 * Los tamaños salen de lo que el diseño pide en pantalla, por dos:
 *  · ficha de catálogo ≈ 420 px CSS, ficha de producto ≈ 790 px CSS  → 1400 de ancho
 *  · vitrina de portada ≈ 900 px CSS a sangre                        → 2000 de ancho
 * Con menos, en pantalla retina el navegador agranda y la foto se ve blanda.
 */
const SIZES = {
  p: { w: 1400, h: 1750, src: 2400, q: 78 },
  d: { w: 1400, h: 1750, src: 3000, q: 78 },
  h: { w: 2000, h: 2500, src: 3400, q: 84 },
  c: { w: 1500, h: 2000, src: 2600, q: 80 },
  e: { w: 2200, h: 1467, src: 2800, q: 78 },
  v: { w: 1500, h: 2250, src: 2600, q: 78 },
};

/**
 * Fotografía propia. Si existe `assets-src/<salida>.{jpg,jpeg,png,webp,avif}`,
 * se usa ese archivo en lugar de bajar el negativo de referencia. Sirve para
 * reemplazar piezas una por una sin tocar el manifiesto: para cambiar la
 * vitrina alcanza con dejar `assets-src/h/aurore.jpg` y volver a correr esto.
 */
const LOCAL_DIR = path.join(ROOT, 'assets-src');
const LOCAL_EXT = ['.jpg', '.jpeg', '.png', '.webp', '.avif', '.tif', '.tiff'];

async function localSource(out) {
  for (const ext of LOCAL_EXT) {
    const file = path.join(LOCAL_DIR, `${out}${ext}`);
    try {
      return await fs.readFile(file);
    } catch {
      /* probamos la siguiente extensión */
    }
  }
  return null;
}

async function download(id, width) {
  const url = `https://images.unsplash.com/${id}?w=${width}&q=85&fm=jpg&fit=max`;
  for (let i = 0; i < 4; i++) {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return Buffer.from(await res.arrayBuffer());
    } catch (err) {
      if (i === 3) throw new Error(`${id}: ${err.message}`);
      await new Promise((r) => setTimeout(r, 800 * (i + 1)));
    }
  }
}

/** Zoom real sobre el negativo: recorta el 52% central-superior y lo reencuadra 4:5. */
async function detailCrop(buf, target) {
  const meta = await sharp(buf).metadata();
  const ratio = target.w / target.h;
  let cw = Math.round(meta.width * 0.54);
  let ch = Math.round(cw / ratio);
  if (ch > meta.height * 0.9) {
    ch = Math.round(meta.height * 0.9);
    cw = Math.round(ch * ratio);
  }
  const left = Math.round((meta.width - cw) / 2);
  const top = Math.round(Math.min(meta.height - ch, meta.height * 0.22));
  return sharp(buf).extract({ left, top: Math.max(0, top), width: cw, height: ch });
}

const blur = {};
const mine = [];
let done = 0;

async function run() {
  for (const dir of ['p', 'e', 'c', 'h', 'w']) await fs.mkdir(path.join(OUT, dir), { recursive: true });

  const queue = [...MANIFEST];
  const failures = [];

  const worker = async () => {
    while (queue.length) {
      const [id, out, mode] = queue.shift();
      const size = SIZES[mode];
      try {
        const own = await localSource(out);
        if (own) mine.push(out);
        const buf = own ?? (await download(id, size.src));
        // Un negativo propio ya viene encuadrado: no se le aplica el zoom de detalle.
        const pipeline = mode === 'd' && !own ? await detailCrop(buf, size) : sharp(buf);
        let flat = await pipeline.resize(size.w, size.h, { fit: 'cover', position: 'centre' }).toBuffer();
        if (RETOUCH[out]) flat = await retouch(flat, RETOUCH[out], size.w, size.h);

        const resized = sharp(flat);
        await resized.clone().webp({ quality: size.q, effort: 5 }).toFile(path.join(OUT, `${out}.webp`));

        const lqip = await resized.clone().resize(20, null).blur(1.4).webp({ quality: 32 }).toBuffer();
        blur[`/media/${out}.webp`] = `data:image/webp;base64,${lqip.toString('base64')}`;
      } catch (err) {
        failures.push(`${out} · ${err.message}`);
      }
      process.stdout.write(`\r  ${++done}/${MANIFEST.length}`);
    }
  };

  await Promise.all(Array.from({ length: 6 }, worker));
  process.stdout.write('\n');

  const keys = Object.keys(blur).sort();
  const body = keys.map((k) => `  ${JSON.stringify(k)}: ${JSON.stringify(blur[k])},`).join('\n');
  await fs.writeFile(
    path.join(ROOT, 'src', 'lib', 'blur.generated.ts'),
    `// Generado por scripts/fetch-assets.mjs — no editar a mano.\n\nexport const BLUR: Record<string, string> = {\n${body}\n};\n\nexport const blurFor = (src: string): string | undefined => BLUR[src];\n`,
    'utf8',
  );

  console.log(`  ${keys.length} imágenes · LQIP escrito en src/lib/blur.generated.ts`);
  if (mine.length) console.log(`  ${mine.length} desde assets-src: ${mine.join(', ')}`);
  if (failures.length) {
    console.log('\n  Fallos:');
    failures.forEach((f) => console.log('   ·', f));
    process.exitCode = 1;
  }
}

run();

