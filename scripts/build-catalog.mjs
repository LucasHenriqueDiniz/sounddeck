#!/usr/bin/env node
/**
 * Builds a remote-catalog.json + a staged packs/<id>/<file>.wav tree from a
 * local folder of classic Windows sound-scheme .zip archives (the kind
 * distributed by fan-archival sites such as https://lelegofrog.github.io/wav.html).
 *
 * This is a one-off authoring tool, not part of the shipped app. Its output
 * is meant to be uploaded to a public R2 bucket by hand (`wrangler r2 object
 * put`) once that bucket exists — see services/tauri/remoteCatalogService.ts
 * for the app-side consumer, currently unwired pending that bucket.
 *
 * Usage:
 *   node scripts/build-catalog.mjs [sourceDir] [outputDir]
 *
 * sourceDir defaults to the folder the packs were downloaded into.
 * outputDir defaults to a folder under the OS temp dir (kept out of git).
 */
import AdmZip from "adm-zip";
import { copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const SOURCE_DIR = process.argv[2] ?? "C:\\Users\\Lucas Diniz\\Downloads\\Nova pasta (2)";
const OUTPUT_DIR = process.argv[3] ?? join(tmpdir(), "sounddeck-catalog");
const SOURCE_CREDIT = "Arquivos de som via https://lelegofrog.github.io/wav.html";

// ---------------------------------------------------------------------------
// Cover images — optional, per pack id. Default is a freely-licensed or
// original photo (see PHOTO_CREDITS / DESIGN.md), but 17 packs are a
// documented trademark exception — see the comment above COVER_PHOTO_CREDITS.
// Falls back to the generated gradient+glyph when a pack has no entry here.
// ---------------------------------------------------------------------------
const SCRIPT_DIR = fileURLToPath(new URL(".", import.meta.url));
const COVER_IMAGES_DIR = join(SCRIPT_DIR, "cover-images");

const COVER_IMAGE_OVERRIDES = {
  "xp-real": "xp-real.jpg",
  win10: "win10.jpg",
  win98: "win98.jpg",
  win8: "win8.jpg",
  "win7-afternoon": "win7-afternoon.jpg",
  "win7-calligraphy": "win7-calligraphy.jpg",
  "win7-characters": "win7-characters.jpg",
  "win7-cityscape": "win7-cityscape.jpg",
  "win7-delta": "win7-delta.jpg",
  "win7-festival": "win7-festival.jpg",
  "win7-garden": "win7-garden.jpg",
  "win7-heritage": "win7-heritage.jpg",
  "win7-landscape": "win7-landscape.jpg",
  "win7-quirky": "win7-quirky.jpg",
  "win7-raga": "win7-raga.jpg",
  "win7-savanna": "win7-savanna.jpg",
  "win7-sonata": "win7-sonata.jpg",
  "plus95-jungle": "plus95-jungle.jpg",
  "plus95-musica": "plus95-musica.jpg",
  "plus95-robotz": "plus95-robotz.jpg",
  "plus95-utopia": "plus95-utopia.jpg",
  "vista-glass": "vista-glass.jpg",
  "vista-pearl": "vista-pearl.jpg",
  "vista-tinker": "vista-tinker.jpg",
  "plusxp-aquarium": "plusxp-aquarium.jpg",
  "plusxp-davinci": "plusxp-davinci.jpg",
  "plusxp-nature": "plusxp-nature.jpg",
  "plusxp-space": "plusxp-space.jpg",
};

// Vista/Plus! 95/Plus! XP covers below are freely licensed (Unsplash License)
// and chosen to evoke the pack's theme without reproducing any
// Microsoft-authored artwork — the DESIGN.md default. Museum-provided
// reproductions (Art Institute of Chicago) are public-domain photographs of
// public-domain artworks.
//
// Exception, by explicit product decision (not the DESIGN.md default):
// xp-real/win10/win98/win8/win7-delta use Microsoft's own official
// logo/splash/packaging art outright, and every other win7-* cover (including
// the author's personal win7-heritage photo) has the Windows 7 logo
// composited on top. These knowingly redistribute Microsoft-branded material
// — every credit string below says so plainly instead of implying a free
// license that does not apply. This is the full Windows 7/8/10/98/XP set (17
// packs); Vista and the Plus! packs (11 packs) stay on the DESIGN.md default
// since no logo asset was supplied for those sub-brands.
const COVER_PHOTO_CREDITS = {
  "xp-real": "Tela de logo oficial do Windows XP (Microsoft) — uso da marca não coberto por licença livre.",
  win10: "Gráfico de marca oficial do Windows 10 (Microsoft) — uso da marca não coberto por licença livre.",
  win98: "Tela de logo oficial do Windows 98 (Microsoft) — uso da marca não coberto por licença livre.",
  win8: "Tela de marca oficial do Windows 8 (Microsoft) — uso da marca não coberto por licença livre.",
  "win7-afternoon": "Foto de Rui Marinho via Unsplash (Unsplash License, uso livre) — logo do Windows 7 adicionada por composição, uso da marca não coberto por licença livre.",
  "win7-calligraphy": "Foto de Yifeng Lu via Unsplash (Unsplash License, uso livre) — logo do Windows 7 adicionada por composição, uso da marca não coberto por licença livre.",
  "win7-characters": "Render 3D de origem não identificada, via Reddit — logo do Windows 7 adicionada por composição, uso da marca não coberto por licença livre.",
  "win7-cityscape": "Foto de Julien Maculan via Unsplash (Unsplash License, uso livre) — logo do Windows 7 adicionada por composição, uso da marca não coberto por licença livre.",
  "win7-delta": "Arte oficial da embalagem do Windows 7 Delta Extras Pack (Microsoft) — uso da marca não coberto por licença livre.",
  "win7-festival": "Foto de origem não identificada, via TechTudo/Globo — logo do Windows 7 adicionada por composição, uso da marca não coberto por licença livre.",
  "win7-garden": "Foto de Annie Spratt via Unsplash (Unsplash License, uso livre) — logo do Windows 7 adicionada por composição, uso da marca não coberto por licença livre.",
  "win7-heritage": "Foto pessoal do autor do projeto (ponte de dezessete arcos, Palácio de Verão) — logo do Windows 7 adicionada por composição, uso da marca não coberto por licença livre.",
  "win7-landscape": "Foto de Mohammed Shonar via Unsplash (Unsplash License, uso livre) — logo do Windows 7 adicionada por composição, uso da marca não coberto por licença livre.",
  "win7-quirky": "Foto de Karla Vidal via Unsplash (Unsplash License, uso livre) — logo do Windows 7 adicionada por composição, uso da marca não coberto por licença livre.",
  "win7-raga": "Foto de Gowtham AGM via Unsplash (Unsplash License, uso livre) — logo do Windows 7 adicionada por composição, uso da marca não coberto por licença livre.",
  "win7-savanna": "Foto de Justin Lane via Unsplash (Unsplash License, uso livre) — logo do Windows 7 adicionada por composição, uso da marca não coberto por licença livre.",
  "win7-sonata": "Foto de Johannes Plenio via Unsplash (Unsplash License, uso livre) — logo do Windows 7 adicionada por composição, uso da marca não coberto por licença livre.",
  "plus95-jungle": "Foto de Geio Tischler via Unsplash (Unsplash License, uso livre)",
  "plus95-musica": "Foto de Gabriel Lerner via Unsplash (Unsplash License, uso livre)",
  "plus95-robotz": "Foto de Emilipothèse via Unsplash (Unsplash License, uso livre)",
  "plus95-utopia": "Foto de Jivan Garcha via Unsplash (Unsplash License, uso livre)",
  "vista-glass": "Foto de A. C. via Unsplash (Unsplash License, uso livre)",
  "vista-pearl": "Foto de Rick Rothenberg via Unsplash (Unsplash License, uso livre)",
  "vista-tinker": "Foto de Tim Mossholder via Unsplash (Unsplash License, uso livre)",
  "plusxp-aquarium": "Foto de J Cruikshank via Unsplash (Unsplash License, uso livre)",
  "plusxp-davinci": "Reprodução do Art Institute of Chicago via Unsplash (domínio público)",
  "plusxp-nature": "Foto de Geranimo via Unsplash (Unsplash License, uso livre)",
  "plusxp-space": "Foto de Aron Visuals via Unsplash (Unsplash License, uso livre)",
};

// ---------------------------------------------------------------------------
// Filename -> WindowsEventId mapping
// ---------------------------------------------------------------------------

function normalize(fileName) {
  return fileName
    .replace(/\.(wav)$/i, "")
    .replace(/[_-]/g, " ")
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

const ev = (event) => ({ app: ".Default", event });

// Ordered most-specific-first: the first match wins.
const KEYWORD_TABLE = [
  { match: ["battery critical", "critical battery"], events: [ev("CriticalBatteryAlarm")] },
  { match: ["battery low", "low battery"], events: [ev("LowBatteryAlarm")] },
  { match: ["hardware fail"], events: [ev("DeviceFail")] },
  { match: ["hardware insert"], events: [ev("DeviceConnect")] },
  { match: ["hardware remove"], events: [ev("DeviceDisconnect")] },
  { match: ["restore up", "restup", "restoreup", "rest up"], events: [ev("RestoreUp")] },
  { match: ["restore down", "restdown", "restoredown", "rest down"], events: [ev("RestoreDown")] },
  { match: ["restore"], events: [ev("RestoreUp"), ev("RestoreDown")] },
  { match: ["menu command", "menu comand", "menucmd", "menu cmd"], events: [ev("MenuCommand")] },
  { match: ["notify calendar"], events: [ev("Notification.Reminder")] },
  { match: ["notify email"], events: [ev("Notification.Mail")] },
  { match: ["notify messaging"], events: [ev("Notification.IM")] },
  { match: ["notify system generic"], events: [ev("BlockedPopup")] },
  { match: ["message nudge"], events: [ev("Notification.IM")] },
  { match: ["new mail", "newmail", "email", "mail"], events: [ev("Notification.Mail")] },
  { match: ["new message", "message"], events: [ev("Notification.IM")] },
  { match: ["reminder"], events: [ev("Notification.Reminder")] },
  { match: ["notify"], events: [ev("Notification.Default")] },
  { match: ["account control", "uac"], events: [ev("WindowsUAC")] },
  { match: ["balloon", "ballo"], events: [ev("BlockedPopup")] },
  { match: ["pop up blocked", "popup blocked", "blocked popup", "blockedpopup"], events: [ev("BlockedPopup")] },
  { match: ["recycle", "empty"], events: [ev("EmptyRecycleBin")] },
  { match: ["navigat"], events: [ev("Navigating")] },
  { match: ["minimize"], events: [ev("Minimize")] },
  { match: ["maximize"], events: [ev("Maximize")] },
  { match: ["open"], events: [ev("Open")] },
  { match: ["close"], events: [ev("Close")] },
  {
    match: ["logon", "sysstart", "the microsoft sound", "welcom", "startup", "start"],
    events: [ev("WindowsLogon")],
  },
  { match: ["logoff", "shutdown", "sysexit", "exit"], events: [ev("WindowsLogoff")] },
  { match: ["asterisk", "asteris", "background"], events: [ev("SystemAsterisk")] },
  { match: ["exclamation", "exclam"], events: [ev("SystemExclamation")] },
  { match: ["question", "foreground"], events: [ev("SystemQuestion")] },
  { match: ["critical stop", "critstop", "critical"], events: [ev("SystemHand")] },
  { match: ["error"], events: [ev("SystemHand")] },
  { match: ["chord"], events: [ev("SystemHand")] },
  { match: ["chimes"], events: [ev("SystemAsterisk")] },
  { match: ["ding", "default sound", "defaultsound"], events: [ev(".Default")] },
  { match: ["default"], events: [ev(".Default")] },
];

function mapFileNameToEvents(fileName) {
  const normalized = normalize(fileName);
  for (const entry of KEYWORD_TABLE) {
    if (entry.match.some((k) => normalized.includes(k))) return entry.events;
  }
  return [];
}

// ---------------------------------------------------------------------------
// Cover art (deterministic gradient + glyph, no image assets required)
// ---------------------------------------------------------------------------

function hashString(s) {
  let h = 0;
  for (let i = 0; i < s.length; i += 1) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

function hslToHex(h, s, l) {
  s /= 100;
  l /= 100;
  const k = (n) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  const toHex = (x) =>
    Math.round(255 * x)
      .toString(16)
      .padStart(2, "0");
  return `#${toHex(f(0))}${toHex(f(8))}${toHex(f(4))}`;
}

function coverFor(name, baseHue) {
  const hue = (baseHue + (hashString(name) % 40) - 20 + 360) % 360;
  const glyph = name
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  return {
    gradientFrom: hslToHex(hue, 55, 52),
    gradientTo: hslToHex((hue + 24) % 360, 55, 24),
    glyph,
  };
}

// ---------------------------------------------------------------------------
// Source manifest — which archives to process and how to group them
// ---------------------------------------------------------------------------
// aolwav.zip is skipped on purpose: its files are AOL Instant Messenger's own
// app sounds (buddy alerts, IM chimes), not Windows AppEvents replacements —
// they don't fit this product's model. fakewav.zip (fan-made "samsung" /
// "whistler" schemes) is skipped too: inconsistent, typo'd naming conventions
// would need a lot of one-off special-casing for two novelty packs — a
// reasonable follow-up, not done here.
//
// NOTE: the live catalog also has "win7" and "vista" packs (plain default
// schemes, 20 events each, ids "win7"/"vista") that are NOT represented
// below. Both were published as one-off exceptions directly to R2 — sourced
// from a different place than everything else here (Internet Archive items
// "windows-7-windows-media-Default-Sound" and
// "WindowsVista.InboxMedium.SoundScheme", real Windows installs' Media
// folders, not lelegofrog.github.io) — because no local archive for either
// exists in SOURCE_DIR. This script's own output has neither entry, so a
// full rerun of build-catalog.mjs + upload-catalog.mjs WOULD wholesale-
// overwrite catalog.json and silently drop both packs from the live catalog
// again (their .wav files would stay in R2, just orphaned/unreferenced). If
// you run the full pipeline before adding matching MANIFEST entries (or a
// script step that reads them back from R2 first), re-add "win7" and
// "vista" to the output catalog by hand before uploading.

const MANIFEST = [
  { source: "10wav.zip", kind: "flat", id: "win10", name: "Windows 10", releaseYear: 2015, hue: 200 },
  { source: "98wav.zip", kind: "flat", id: "win98", name: "Windows 98", releaseYear: 1998, hue: 210 },
  { source: "xpwav.zip", kind: "flat", id: "xp-real", name: "Windows XP", releaseYear: 2001, hue: 205 },
  { source: "win8", kind: "folder", id: "win8", name: "Windows 8", releaseYear: 2012, hue: 195 },
  {
    source: "7wav.zip",
    kind: "nested",
    idPrefix: "win7",
    releaseYear: 2009,
    hue: 205,
    description: (name) => `Esquema oficial "${name}", um dos temas de som incluídos no Windows 7.`,
  },
  {
    source: "95wavall.zip",
    kind: "nested",
    idPrefix: "plus95",
    releaseYear: 1995,
    hue: 30,
    description: (name) => `Tema "${name}" do Microsoft Plus! para Windows 95.`,
  },
  {
    source: "vistawavall.zip",
    kind: "nested",
    idPrefix: "vista",
    releaseYear: 2006,
    hue: 220,
    description: (name) => `Esquema oficial "${name}", um dos temas de som incluídos no Windows Vista.`,
  },
  {
    source: "xpwavall.zip",
    kind: "nested",
    idPrefix: "plusxp",
    releaseYear: 2001,
    hue: 40,
    description: (name) => `Tema "${name}" do Microsoft Plus! para Windows XP.`,
  },
];

// ---------------------------------------------------------------------------
// Build
// ---------------------------------------------------------------------------

function slugify(name) {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function readEntriesFlat(entry) {
  // { name, buffer }[]
  if (entry.kind === "folder") {
    const dir = join(SOURCE_DIR, entry.source);
    if (!existsSync(dir)) return null;
    return readdirSync(dir)
      .filter((f) => statSync(join(dir, f)).isFile() && /\.wav$/i.test(f))
      .map((f) => ({ name: f, buffer: null, filePath: join(dir, f) }));
  }
  const zipPath = join(SOURCE_DIR, entry.source);
  if (!existsSync(zipPath)) return null;
  const zip = new AdmZip(zipPath);
  return zip
    .getEntries()
    .filter((e) => !e.isDirectory && /\.wav$/i.test(e.entryName) && !e.entryName.includes("/"))
    .map((e) => ({ name: e.entryName, buffer: e.getData(), filePath: null }));
}

function readNestedGroups(entry) {
  const zipPath = join(SOURCE_DIR, entry.source);
  if (!existsSync(zipPath)) return null;
  const zip = new AdmZip(zipPath);
  const groups = new Map();
  for (const e of zip.getEntries()) {
    if (e.isDirectory || !/\.wav$/i.test(e.entryName)) continue;
    const slashIndex = e.entryName.indexOf("/");
    if (slashIndex === -1) continue; // skip root-level extras (e.g. teaser files)
    const folder = e.entryName.slice(0, slashIndex);
    const fileName = e.entryName.slice(slashIndex + 1);
    if (fileName.includes("/")) continue; // skip deeper nesting (e.g. aim/4.1/*)
    if (!groups.has(folder)) groups.set(folder, []);
    groups.get(folder).push({ name: fileName, buffer: e.getData(), filePath: null });
  }
  return groups;
}

function buildPack(id, name, releaseYear, description, hue, files, stagingRoot) {
  const seenEvents = new Set();
  const catalogFiles = [];
  const packDir = join(stagingRoot, "packs", id);
  mkdirSync(packDir, { recursive: true });

  for (const file of files) {
    const events = mapFileNameToEvents(file.name);
    if (events.length === 0) continue;
    const unseen = events.filter((e) => !seenEvents.has(e.event));
    if (unseen.length === 0) continue;
    unseen.forEach((e) => seenEvents.add(e.event));

    const bytes = file.buffer ?? readFileSync(file.filePath);
    const destName = file.name.replace(/[\\/]/g, "_");
    writeFileSync(join(packDir, destName), bytes);
    for (const eventId of unseen) {
      catalogFiles.push({ eventId, fileName: destName });
    }
  }

  if (catalogFiles.length === 0) return null;

  const cover = coverFor(name, hue);
  const overrideFile = COVER_IMAGE_OVERRIDES[id];
  let sourceCredit = SOURCE_CREDIT;
  if (overrideFile) {
    const srcPath = join(COVER_IMAGES_DIR, overrideFile);
    if (existsSync(srcPath)) {
      copyFileSync(srcPath, join(packDir, "cover.jpg"));
      cover.imageUrl = "cover.jpg";
      if (COVER_PHOTO_CREDITS[id]) sourceCredit = `${SOURCE_CREDIT} · ${COVER_PHOTO_CREDITS[id]}`;
    }
  }

  return {
    id,
    name,
    author: "Microsoft",
    origin: "microsoft",
    releaseYear,
    description,
    cover,
    sourceCredit,
    files: catalogFiles,
  };
}

function main() {
  mkdirSync(OUTPUT_DIR, { recursive: true });
  const packs = [];
  const report = [];

  for (const entry of MANIFEST) {
    if (entry.kind === "flat" || entry.kind === "folder") {
      const files = readEntriesFlat(entry);
      if (!files) {
        report.push(`SKIP (not found): ${entry.source}`);
        continue;
      }
      const pack = buildPack(
        entry.id,
        entry.name,
        entry.releaseYear,
        `Esquema de sons original do ${entry.name}.`,
        entry.hue,
        files,
        OUTPUT_DIR,
      );
      if (pack) {
        packs.push(pack);
        report.push(`OK: ${pack.id} (${pack.files.length} eventos mapeados de ${files.length} .wav)`);
      } else {
        report.push(`SKIP (0 eventos mapeados): ${entry.source}`);
      }
    } else if (entry.kind === "nested") {
      const groups = readNestedGroups(entry);
      if (!groups) {
        report.push(`SKIP (not found): ${entry.source}`);
        continue;
      }
      for (const [folder, files] of groups) {
        const id = `${entry.idPrefix}-${slugify(folder)}`;
        const pack = buildPack(
          id,
          folder,
          entry.releaseYear,
          entry.description(folder),
          entry.hue,
          files,
          OUTPUT_DIR,
        );
        if (pack) {
          packs.push(pack);
          report.push(`OK: ${pack.id} (${pack.files.length} eventos mapeados de ${files.length} .wav)`);
        } else {
          report.push(`SKIP (0 eventos mapeados): ${entry.source}/${folder}`);
        }
      }
    }
  }

  const catalog = { generatedAt: new Date().toISOString(), packs };
  writeFileSync(join(OUTPUT_DIR, "catalog.json"), JSON.stringify(catalog, null, 2));

  console.log(report.join("\n"));
  console.log(`\n${packs.length} packs gerados em: ${OUTPUT_DIR}`);
  console.log(`catalog.json: ${join(OUTPUT_DIR, "catalog.json")}`);
}

main();
