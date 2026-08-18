import type { PackEventAssignment } from "../../types/soundEvent";
import type { SoundPack } from "../../types/pack";

/**
 * Local-only pack storage. Custom packs never leave the machine — no upload,
 * no remote catalog involvement — so localStorage (persisted by the WebView2
 * profile, same as the language preference in i18n/index.tsx) is enough;
 * there is no need for a new Tauri command or filesystem capability. Audio
 * files themselves are never copied: an assignment's `fileName` is resolved
 * back to the absolute path the user picked only at apply/preview time,
 * exactly like the Editor's "replace file" flow already works.
 */
const STORAGE_KEY = "sounddeck.customPacks";

function hashString(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return hash;
}

function coverForName(name: string): SoundPack["cover"] {
  const hash = hashString(name || "custom");
  const hue = hash % 360;
  const glyph =
    name
      .trim()
      .split(/\s+/)
      .map((word) => word[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "?";
  return {
    gradientFrom: `hsl(${hue}, 55%, 42%)`,
    gradientTo: `hsl(${(hue + 40) % 360}, 55%, 18%)`,
    glyph,
  };
}

function slugify(name: string): string {
  const slug = name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  return slug || "pack";
}

function readAll(): SoundPack[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as SoundPack[]) : [];
  } catch {
    return [];
  }
}

function writeAll(packs: SoundPack[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(packs));
}

export function listCustomPacks(): SoundPack[] {
  return readAll();
}

export interface CreateCustomPackInput {
  name: string;
  /** Already resolved with t() at the call site — see the "author" comment in PackDetails.tsx. */
  author: string;
  description: string;
  assignments: PackEventAssignment[];
}

export function saveCustomPack(input: CreateCustomPackInput): SoundPack {
  const packs = readAll();
  const existingIds = new Set(packs.map((p) => p.id));
  const base = `custom-${slugify(input.name)}`;
  let id = base;
  let suffix = 2;
  while (existingIds.has(id)) {
    id = `${base}-${suffix}`;
    suffix += 1;
  }

  const pack: SoundPack = {
    id,
    name: input.name,
    author: input.author,
    origin: "custom",
    description: input.description,
    cover: coverForName(input.name),
    assignments: input.assignments,
  };

  writeAll([...packs, pack]);
  return pack;
}

export function deleteCustomPack(id: string): void {
  writeAll(readAll().filter((p) => p.id !== id));
}
