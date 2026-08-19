/**
 * Writes one static HTML file per (language, page).
 *
 * The old site served translated HTML per language on its own URL, and that
 * was deliberate: a JavaScript language switcher got only the default language
 * indexed. This site is React, so it renders each page to a string at build
 * time and the client hydrates it — same SEO properties, same interactivity.
 *
 * Run as part of `npm run build`, after both Vite passes.
 */
import { readFileSync, writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DIST = join(ROOT, 'dist');
const SERVER_DIR = join(ROOT, 'dist-ssr');
// Canonical host. sounddeck.lucashdo.com still serves the same pages, so its
// copies carry a canonical pointing here — that's what tells a crawler the
// site moved, instead of leaving two hosts competing as duplicates.
const SITE_ORIGIN = 'https://chimer.lucashdo.com';
const SITE_NAME = 'Chimer';
const OG_IMAGE = `${SITE_ORIGIN}/og.png`;

// Open Graph wants a territorialised locale, not the bare language code the
// rest of the site keys off. The pairing is nominal — the copy is not
// region-specific — but a bare "pt" is ignored by most crawlers.
const OG_LOCALES = { en: 'en_US', pt: 'pt_BR', es: 'es_ES', de: 'de_DE', fr: 'fr_FR' };

const { render, allPages, LANGS, hrefFor } = await import(
  pathToFileURL(join(SERVER_DIR, 'entry-server.js')).href
);

const template = readFileSync(join(DIST, 'index.html'), 'utf8');

const escape = (value) =>
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const pages = allPages();
const urls = [];

for (const { lang, route, url } of pages) {
  const { html, title, description } = render(lang, route.id);

  // Every language links to its siblings so a crawler that finds one finds
  // them all, and none of them is treated as duplicate content.
  const alternates = LANGS.map(
    (code) =>
      `<link rel="alternate" hreflang="${code}" href="${SITE_ORIGIN}${hrefFor(code, route.path)}" />`,
  )
    .concat(`<link rel="alternate" hreflang="x-default" href="${SITE_ORIGIN}${hrefFor('en', route.path)}" />`)
    .join('\n    ');

  const canonical = `${SITE_ORIGIN}${url}`;

  // og:image must be absolute. A relative "/og.png" is silently dropped by
  // every crawler that reads it, so the site had no link preview at all.
  const social = [
    `<meta property="og:type" content="website" />`,
    `<meta property="og:site_name" content="${SITE_NAME}" />`,
    `<meta property="og:url" content="${canonical}" />`,
    `<meta property="og:title" content="${escape(title)}" />`,
    `<meta property="og:description" content="${escape(description)}" />`,
    `<meta property="og:image" content="${OG_IMAGE}" />`,
    `<meta property="og:image:width" content="1200" />`,
    `<meta property="og:image:height" content="630" />`,
    `<meta property="og:locale" content="${OG_LOCALES[lang]}" />`,
    ...LANGS.filter((code) => code !== lang).map(
      (code) => `<meta property="og:locale:alternate" content="${OG_LOCALES[code]}" />`,
    ),
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${escape(title)}" />`,
    `<meta name="twitter:description" content="${escape(description)}" />`,
    `<meta name="twitter:image" content="${OG_IMAGE}" />`,
  ].join('\n    ');

  // One structured-data entity for the app, on the home page of each language.
  // It deliberately claims nothing it cannot back up: no rating, no review
  // count, no version. downloadUrl points at the download page rather than at
  // a release asset, for the same reason nothing else here hardcodes a
  // version — the filename changes every release.
  const jsonLd =
    route.id === 'home'
      ? `\n    <script type="application/ld+json">${JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'SoftwareApplication',
          name: SITE_NAME,
          url: canonical,
          description,
          applicationCategory: 'UtilitiesApplication',
          operatingSystem: 'Windows 10, Windows 11',
          image: OG_IMAGE,
          inLanguage: lang,
          isAccessibleForFree: true,
          license: 'https://opensource.org/licenses/MIT',
          downloadUrl: `${SITE_ORIGIN}${hrefFor(lang, '/download')}`,
          offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
          author: { '@type': 'Person', name: 'Lucas Henrique Diniz Ostroski' },
          // A "<" inside JSON would end the script element early. No string
          // here contains one today; escaping means a future translation that
          // does can't silently break the page.
        }).replace(/</g, '\\u003c')}</script>`
      : '';

  const page = template
    .replace('<html lang="en">', `<html lang="${lang}">`)
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${escape(title)}</title>`)
    .replace(
      /<meta name="description"[^>]*>/,
      `<meta name="description" content="${escape(description)}" />\n    ` +
        `<link rel="canonical" href="${canonical}" />\n    ${alternates}` +
        `\n    ${social}${jsonLd}`,
    )
    .replace('<div id="root"></div>', `<div id="root">${html}</div>`);

  const outDir = join(DIST, url === '/' ? '.' : url.replace(/^\//, ''));
  mkdirSync(outDir, { recursive: true });
  writeFileSync(join(outDir, 'index.html'), page, 'utf8');

  // 404s are served by Cloudflare from a file at the root, not from /404/.
  if (route.id === 'notFound' && lang === 'en') {
    writeFileSync(join(DIST, '404.html'), page, 'utf8');
  }

  if (route.id !== 'notFound') urls.push(canonical);
}

writeFileSync(
  join(DIST, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    urls.map((url) => `  <url><loc>${url}</loc></url>`).join('\n') +
    `\n</urlset>\n`,
  'utf8',
);

// Cloudflare can override this file at the edge: the zone's AI Crawl Control
// has a "Managed robots.txt" toggle that prepends its own content-signal
// preamble and AI-crawler Disallow rules ahead of whatever the origin serves.
// It is off for this zone on purpose — an open-source app gains from being
// citable by AI assistants — but if this file ever stops matching what the
// site actually serves, that toggle is the first place to look.
writeFileSync(
  join(DIST, 'robots.txt'),
  `User-agent: *\nAllow: /\n\nSitemap: ${SITE_ORIGIN}/sitemap.xml\n`,
  'utf8',
);

// The SSR bundle is a build artefact, not something to publish.
rmSync(SERVER_DIR, { recursive: true, force: true });

console.log(`prerendered ${pages.length} pages in ${LANGS.length} languages, ${urls.length} URLs in the sitemap`);
