/**
 * Generates src/packs.generated.ts from the published catalog.
 *
 * Baked in at build time rather than fetched at runtime, for three reasons:
 * the pack list is part of what the page is *about* and should be in the
 * served HTML; the bucket sends no Cache-Control, so a runtime fetch is a
 * coin flip between fresh and days-old; and the grid would otherwise pop in
 * after paint.
 *
 * Re-run it after publishing catalog changes:  npm run build:packs --prefix site
 */
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const BASE = 'https://pub-a7bb18fa003c4b529e764f1c308a7146.r2.dev';
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'src', 'packs.generated.ts');

/** Groups the catalog into the families the collection section shows. */
function familyOf(pack) {
  const id = pack.id;
  if (id.startsWith('plus95') || id.startsWith('plusxp')) return 'plus';
  if (id.startsWith('win7-')) return 'win7themes';
  if (id.startsWith('vista-')) return 'vistathemes';
  return 'system';
}

const response = await fetch(`${BASE}/catalog.json`, { cache: 'no-store' });
if (!response.ok) throw new Error(`catalog fetch failed: HTTP ${response.status}`);
const catalog = await response.json();

/**
 * The sound the preview button plays. Same preference order the app uses to
 * confirm an apply: the logon chime is the signature of each of these
 * schemes, so it's the one that actually identifies the pack.
 */
const PREVIEW_EVENTS = ['WindowsLogon', 'SystemAsterisk', 'DeviceConnect', 'Notification.Default', '.Default'];

/**
 * Whether a .wav can actually be previewed in a browser.
 *
 * This exists because win98's logon sound is a 31ms MS-ADPCM stub: the button
 * was enabled, the request returned 200, and nothing played. Two distinct
 * reasons a file can be a dead preview, both visible in the header:
 *
 *  - Format. Browsers decode PCM (1), float (3) and — verified, not assumed —
 *    MP3-in-WAV (85), which is what the thirteen Windows 7 themes ship. They
 *    do not decode MS-ADPCM (2) or IMA-ADPCM (17).
 *  - Length. A file that decodes but lasts 31ms is silence to a listener.
 *    The floor is 150ms, not something rounder: vista-glass ships a genuine
 *    219ms logon blip whose envelope decays naturally rather than being cut
 *    off, and swapping that for another sound would misrepresent the pack.
 *
 * Only the first 4 KB is fetched, so probing all thirty packs costs ~120 KB.
 */
const DECODABLE_FORMATS = new Set([1, 3, 85]);
const MIN_PREVIEW_SECONDS = 0.15;

async function isPlayable(url) {
  const response = await fetch(url, { headers: { Range: 'bytes=0-4095' } });
  if (!response.ok && response.status !== 206) return false;
  const view = new DataView(await response.arrayBuffer());
  if (view.byteLength < 44) return false;

  let offset = 12;
  let bytesPerSecond = 0;
  let format = 0;
  while (offset + 8 <= view.byteLength) {
    const id = String.fromCharCode(...new Uint8Array(view.buffer, offset, 4));
    const size = view.getUint32(offset + 4, true);
    if (id === 'fmt ') {
      format = view.getUint16(offset + 8, true);
      bytesPerSecond = view.getUint32(offset + 16, true);
    } else if (id === 'data') {
      const seconds = bytesPerSecond ? size / bytesPerSecond : 0;
      return DECODABLE_FORMATS.has(format) && seconds >= MIN_PREVIEW_SECONDS;
    }
    offset += 8 + size + (size % 2);
  }
  return false;
}

async function previewUrlFor(pack) {
  const ordered = [
    ...PREVIEW_EVENTS.map((event) => pack.files.find((f) => f.eventId.event === event)).filter(Boolean),
    ...pack.files,
  ];
  const seen = new Set();
  for (const file of ordered) {
    if (seen.has(file.fileName)) continue;
    seen.add(file.fileName);
    const url = `${BASE}/packs/${pack.id}/${encodeURIComponent(file.fileName)}`;
    if (await isPlayable(url)) {
      if (file !== ordered[0]) {
        console.warn(`  ${pack.id}: falling back to ${file.fileName} — the preferred sound is not playable`);
      }
      return url;
    }
  }
  console.warn(`  ${pack.id}: no playable sound, preview disabled`);
  return null;
}

const packs = await Promise.all(catalog.packs.map(async (pack) => ({
  id: pack.id,
  name: pack.name,
  author: pack.author,
  releaseYear: pack.releaseYear ?? null,
  soundCount: pack.files.length,
  previewUrl: await previewUrlFor(pack),
  family: familyOf(pack),
  // Every pack in the catalog carries a cover today; fall back to the
  // generated gradient rather than rendering a broken image if one doesn't.
  coverUrl: pack.cover?.imageUrl ? `${BASE}/packs/${pack.id}/${pack.cover.imageUrl}` : null,
  gradientFrom: pack.cover?.gradientFrom ?? '#444',
  gradientTo: pack.cover?.gradientTo ?? '#222',
})));

// Most recognisable first — these are the ones people come looking for.
const FEATURED = ['xp-real', 'vista', 'win7', 'win98', 'win10', 'win8'];
packs.sort((a, b) => {
  const ia = FEATURED.indexOf(a.id);
  const ib = FEATURED.indexOf(b.id);
  if (ia !== -1 || ib !== -1) return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
  return a.name.localeCompare(b.name);
});

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(
  OUT,
  `// Generated by scripts/build-packs.mjs from the published catalog.\n` +
    `// Do not edit by hand — re-run \`npm run build:packs\` instead.\n\n` +
    `export interface CatalogPack {\n` +
    `  id: string;\n  name: string;\n  author: string;\n  releaseYear: number | null;\n` +
    `  soundCount: number;\n  previewUrl: string | null;\n` +
    `  family: 'system' | 'win7themes' | 'vistathemes' | 'plus';\n` +
    `  coverUrl: string | null;\n  gradientFrom: string;\n  gradientTo: string;\n}\n\n` +
    `export const PACKS: CatalogPack[] = ${JSON.stringify(packs, null, 2)};\n\n` +
    `export const PACK_COUNT = ${packs.length};\n`,
  'utf8',
);

console.log(`wrote ${packs.length} packs to src/packs.generated.ts`);
