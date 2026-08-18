#!/usr/bin/env node
/**
 * Gera o site estático multilíngue a partir de landing-page/templates/ e dos
 * dicionários em landing-page/i18n/.
 *
 * Cada idioma vira um diretório próprio com HTML já traduzido — nada de troca
 * de idioma por JavaScript. Isso é o que faz o Google indexar todos os idiomas:
 * um crawler sem JS precisa ver o texto no HTML servido.
 *
 * Uso: node scripts/build-landing.mjs
 * Saída: landing-page/dist/ (pronto para `wrangler deploy`)
 */
import { readFileSync, writeFileSync, mkdirSync, readdirSync, copyFileSync, rmSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const LP = join(ROOT, 'landing-page');
const DIST = join(LP, 'dist');
const SITE = 'https://sounddeck.lucashdo.com';

// O primeiro idioma é o padrão e vai para a raiz; os demais para /<code>/.
const LANGS = [
  { code: 'en', htmlLang: 'en', ogLocale: 'en_US', label: 'English' },
  { code: 'pt', htmlLang: 'pt-BR', ogLocale: 'pt_BR', label: 'Português' },
  { code: 'es', htmlLang: 'es', ogLocale: 'es_ES', label: 'Español' },
  { code: 'de', htmlLang: 'de', ogLocale: 'de_DE', label: 'Deutsch' },
  { code: 'fr', htmlLang: 'fr', ogLocale: 'fr_FR', label: 'Français' },
];
const DEFAULT = LANGS[0];

const PAGES = [
  { file: 'index', path: '/', priority: '1.0' },
  { file: 'download', path: '/download', priority: '0.9' },
  { file: 'changelog', path: '/changelog', priority: '0.6' },
  { file: 'privacy', path: '/privacy', priority: '0.3' },
  { file: '404', path: null }, // fora do sitemap
];

const dict = Object.fromEntries(
  LANGS.map((l) => [l.code, JSON.parse(readFileSync(join(LP, 'i18n', `${l.code}.json`), 'utf8'))]),
);

const base = (code) => (code === DEFAULT.code ? '' : `/${code}`);
const urlFor = (code, path) => `${SITE}${base(code)}${path === '/' ? '/' : path}`;
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');

// Chaves que o site.js precisa em runtime (renderiza download e changelog a
// partir da API do GitHub, depois do HTML já ter sido servido).
const runtimeKeys = (d) => Object.fromEntries(Object.entries(d).filter(([k]) => /^(dl|cl)\./.test(k)));

function head(lang, page) {
  const d = dict[lang.code];
  const desc = d[`meta.${page.file}.desc`] ?? '';
  const title = d[`meta.${page.file}.title`] ?? 'SoundDeck';
  const path = page.path ?? '/404';
  const canonical = urlFor(lang.code, path);

  const alternates = page.path
    ? LANGS.map((l) => `<link rel="alternate" hreflang="${l.htmlLang}" href="${urlFor(l.code, path)}" />`)
        .concat(`<link rel="alternate" hreflang="x-default" href="${urlFor(DEFAULT.code, path)}" />`)
        .join('\n')
    : '';

  const ld =
    page.file === 'index'
      ? `<script type="application/ld+json">\n${JSON.stringify(
          {
            '@context': 'https://schema.org',
            '@type': 'SoftwareApplication',
            name: 'SoundDeck',
            applicationCategory: 'UtilitiesApplication',
            applicationSubCategory: 'Personalization',
            operatingSystem: 'Windows 10, Windows 11',
            softwareVersion: '0.1.0',
            url: canonical,
            downloadUrl: urlFor(lang.code, '/download'),
            installUrl: urlFor(lang.code, '/download'),
            releaseNotes: urlFor(lang.code, '/changelog'),
            image: `${SITE}/og.png`,
            inLanguage: lang.htmlLang,
            description: desc,
            license: 'https://github.com/LucasHenriqueDiniz/sounddeck/blob/master/LICENSE',
            isAccessibleForFree: true,
            offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
            author: {
              '@type': 'Person',
              name: 'Lucas Henrique Diniz Ostroski',
              url: 'https://github.com/LucasHenriqueDiniz',
            },
            codeRepository: 'https://github.com/LucasHenriqueDiniz/sounddeck',
          },
          null,
          2,
        )}\n</script>`
      : '';

  return [
    `<meta name="description" content="${esc(desc)}" />`,
    `<link rel="canonical" href="${canonical}" />`,
    alternates,
    `<meta property="og:type" content="website" />`,
    `<meta property="og:site_name" content="SoundDeck" />`,
    `<meta property="og:locale" content="${lang.ogLocale}" />`,
    ...LANGS.filter((l) => l.code !== lang.code).map(
      (l) => `<meta property="og:locale:alternate" content="${l.ogLocale}" />`,
    ),
    `<meta property="og:url" content="${canonical}" />`,
    `<meta property="og:title" content="${esc(title)}" />`,
    `<meta property="og:description" content="${esc(desc)}" />`,
    `<meta property="og:image" content="${SITE}/og.png" />`,
    `<meta property="og:image:width" content="1200" />`,
    `<meta property="og:image:height" content="630" />`,
    `<meta property="og:image:type" content="image/png" />`,
    `<meta property="og:image:alt" content="${esc(title)}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${esc(title)}" />`,
    `<meta name="twitter:description" content="${esc(desc)}" />`,
    ld,
    `<script>window.__I18N=${JSON.stringify(runtimeKeys(dict[lang.code]))}</script>`,
  ]
    .filter(Boolean)
    .join('\n');
}

// Links reais, não botões — cada idioma é uma URL, então o seletor precisa ser
// navegável e rastreável. Nomes escritos no próprio idioma (nunca bandeiras:
// bandeira é país, não idioma).
function langSwitcher(lang, page) {
  const path = page.path ?? '/';
  const items = LANGS.map((l) => {
    const current = l.code === lang.code;
    return `<a href="${base(l.code)}${path === '/' ? '/' : path}" lang="${l.htmlLang}" hreflang="${l.htmlLang}"${
      current ? ' aria-current="true"' : ''
    }>${l.label}</a>`;
  }).join('');
  return `<div class="langs">
      <button type="button" class="langs-btn" aria-expanded="false" aria-haspopup="true" aria-label="${esc(
        dict[lang.code]['a11y.lang'] ?? 'Language',
      )}"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18"/></svg><span>${
        lang.label
      }</span></button>
      <div class="langs-menu">${items}</div>
    </div>`;
}

function render(lang, page) {
  const d = dict[lang.code];
  let html = readFileSync(join(LP, 'templates', `${page.file}.html`), 'utf8').replace(/\r\n/g, '\n');

  html = html
    .replace(/\{\{LANG\}\}/g, lang.htmlLang)
    .replace(/\{\{TITLE\}\}/g, esc(d[`meta.${page.file}.title`] ?? 'SoundDeck'))
    .replace(/\{\{BASE\}\}/g, base(lang.code))
    .replace('<!--HEAD-->', head(lang, page))
    .replace('<!--LANGS-->', langSwitcher(lang, page));

  // Substitui o conteúdo de cada elemento traduzível. O texto fica no HTML
  // servido — é isso que o crawler lê.
  html = html.replace(
    /(<([a-z0-9]+)\b[^>]*\bdata-i18n="([^"]+)"[^>]*>)([\s\S]*?)(<\/\2>)/g,
    (m, open, tag, key, _inner, close) => (d[key] != null ? open + d[key] + close : m),
  );
  html = html.replace(/data-i18n-aria="([^"]+)"/g, (m, key) =>
    d[key] != null ? `aria-label="${esc(d[key])}"` : m,
  );

  const missing = [...html.matchAll(/data-i18n="([^"]+)"/g)].map((m) => m[1]).filter((k) => d[k] == null);
  if (missing.length) console.warn(`  ! ${lang.code}/${page.file}: chaves ausentes -> ${[...new Set(missing)].join(', ')}`);

  return html;
}

function copyDir(from, to) {
  mkdirSync(to, { recursive: true });
  for (const e of readdirSync(from)) {
    const src = join(from, e);
    statSync(src).isDirectory() ? copyDir(src, join(to, e)) : copyFileSync(src, join(to, e));
  }
}

// --- build ------------------------------------------------------------------

rmSync(DIST, { recursive: true, force: true });
mkdirSync(DIST, { recursive: true });
copyDir(join(LP, 'static'), DIST);

let count = 0;
for (const lang of LANGS) {
  const dir = lang.code === DEFAULT.code ? DIST : join(DIST, lang.code);
  mkdirSync(dir, { recursive: true });
  for (const page of PAGES) {
    // A 404 do Worker é única e serve o idioma padrão.
    if (page.file === '404' && lang.code !== DEFAULT.code) continue;
    writeFileSync(join(dir, `${page.file}.html`), render(lang, page));
    count++;
  }
}

const urls = LANGS.flatMap((l) =>
  PAGES.filter((p) => p.path).map(
    (p) =>
      `  <url>\n    <loc>${urlFor(l.code, p.path)}</loc>\n` +
      LANGS.map((a) => `    <xhtml:link rel="alternate" hreflang="${a.htmlLang}" href="${urlFor(a.code, p.path)}"/>`).join('\n') +
      `\n    <xhtml:link rel="alternate" hreflang="x-default" href="${urlFor(DEFAULT.code, p.path)}"/>\n` +
      `    <priority>${p.priority}</priority>\n  </url>`,
  ),
);
writeFileSync(
  join(DIST, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${urls.join('\n')}\n</urlset>\n`,
);

writeFileSync(
  join(DIST, 'robots.txt'),
  `User-agent: *\nAllow: /\n\n# AI agents: see /llms.txt for a structured summary of this site.\nSitemap: ${SITE}/sitemap.xml\n`,
);

console.log(`dist/ gerado — ${count} páginas em ${LANGS.length} idiomas, ${urls.length} URLs no sitemap`);
