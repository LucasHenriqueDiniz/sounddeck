// Gera a imagem de Open Graph (1200x630) da landing page a partir de um SVG.
// Uso: node scripts/build-og-image.mjs
import { writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import sharp from 'sharp';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const out = join(root, 'landing-page', 'og.png');

const FONT = 'Segoe UI Variable Text, Segoe UI, system-ui, sans-serif';
const BG = '#16130e';
const ACCENT = '#d99a4e';
const INK = '#f6f1e8';

// Glifos dos packs — mesmas cores dos chips do site.
const packs = [
  { label: 'XP', fill: '#3aa76d', text: '#0d2b1c' },
  { label: 'Vi', fill: '#3f7fd4', text: '#07172e' },
  { label: '7', fill: '#4aa8e8', text: '#062133' },
  { label: '−', fill: '#6b6257', text: '#f6f1e8' },
  { label: '☽', fill: '#4fbf94', text: '#08281c' },
];

const chips = packs
  .map((p, i) => {
    const x = 96 + i * 78;
    return `
    <circle cx="${x + 26}" cy="512" r="26" fill="${p.fill}" />
    <text x="${x + 26}" y="512" font-family="${FONT}" font-size="21" font-weight="600"
          fill="${p.text}" text-anchor="middle" dominant-baseline="central">${p.label}</text>`;
  })
  .join('');

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <radialGradient id="glow" cx="0.78" cy="0.18" r="0.75">
      <stop offset="0%" stop-color="${ACCENT}" stop-opacity="0.30" />
      <stop offset="60%" stop-color="${ACCENT}" stop-opacity="0.05" />
      <stop offset="100%" stop-color="${ACCENT}" stop-opacity="0" />
    </radialGradient>
    <linearGradient id="mark" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${ACCENT}" />
      <stop offset="100%" stop-color="#b9762f" />
    </linearGradient>
  </defs>

  <rect width="1200" height="630" fill="${BG}" />
  <rect width="1200" height="630" fill="url(#glow)" />
  <rect x="0" y="0" width="1200" height="6" fill="${ACCENT}" />

  <!-- marca -->
  <rect x="96" y="86" width="56" height="56" rx="18" fill="url(#mark)" />
  <g transform="translate(110 100) scale(1.17)" fill="none" stroke="#ffffff"
     stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
    <path d="M11 5 6 9H2v6h4l5 4z" />
    <path d="M15.5 8.5a5 5 0 0 1 0 7" />
  </g>
  <text x="172" y="123" font-family="${FONT}" font-size="34" font-weight="600" fill="${INK}">SoundDeck</text>

  <!-- headline -->
  <text x="96" y="252" font-family="${FONT}" font-size="76" font-weight="600"
        fill="${INK}" letter-spacing="-1.5">Um seletor de sons</text>
  <text x="96" y="340" font-family="${FONT}" font-size="76" font-weight="600"
        fill="${INK}" letter-spacing="-1.5">para o Windows.</text>

  <!-- subline -->
  <text x="96" y="410" font-family="${FONT}" font-size="29" fill="${INK}" opacity="0.72">
    Escolha um pack, ouça a prévia, aplique.
  </text>

  <!-- packs -->
  <text x="96" y="466" font-family="${FONT}" font-size="18" font-weight="600"
        fill="${ACCENT}" letter-spacing="2.4">CINCO PACKS INCLUSOS</text>
  ${chips}

  <!-- rodapé -->
  <text x="96" y="586" font-family="${FONT}" font-size="22" fill="${INK}" opacity="0.5">
    Windows 10 e 11 · gratuito · código aberto
  </text>
</svg>`;

const png = await sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toBuffer();
await writeFile(out, png);
const { width, height } = await sharp(png).metadata();
console.log(`og.png ${width}x${height} — ${(png.length / 1024).toFixed(1)} KiB`);
