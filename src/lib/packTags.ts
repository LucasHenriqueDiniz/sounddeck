import type { SoundPack } from "../types/pack";
import type { TranslationKey } from "../i18n";

/**
 * Tags are derived purely from fields already in SoundPack (id prefix,
 * origin) — no catalog.json change or re-upload needed. Order matters only
 * in that more specific prefixes should be checked first; ties resolve to
 * the same label here, so it isn't load-bearing today.
 *
 * Era tags ("Windows 10", "Plus!") are OS/product names — never translated,
 * same spelling in every locale. Origin tags are translation keys, resolved
 * with useT() at render time; resolveTagLabel() tells the two apart.
 */
const ERA_PREFIXES: Array<{ prefix: string; label: string }> = [
  { prefix: "win10", label: "Windows 10" },
  { prefix: "win98", label: "Windows 98" },
  { prefix: "win8", label: "Windows 8" },
  { prefix: "win7", label: "Windows 7" },
  { prefix: "vista", label: "Windows Vista" },
  { prefix: "plusxp", label: "Windows XP" },
  { prefix: "xp", label: "Windows XP" },
  { prefix: "plus95", label: "Windows 95" },
];

export const ORIGIN_TAG_KEY: Record<SoundPack["origin"], TranslationKey> = {
  microsoft: "pack.origin.official",
  community: "pack.origin.community",
  chimer: "pack.origin.chimer",
  custom: "pack.origin.custom",
};

const ORIGIN_TAG_KEYS = new Set<string>(Object.values(ORIGIN_TAG_KEY));

/** True for the origin-tag translation keys; false for literal era tags like "Windows 7". */
export function isOriginTag(tag: string): tag is TranslationKey {
  return ORIGIN_TAG_KEYS.has(tag);
}

/** Resolves a tag from derivePackTags() to display text, translating origin tags only. */
export function resolveTagLabel(t: (key: TranslationKey) => string, tag: string): string {
  return isOriginTag(tag) ? t(tag) : tag;
}

export function derivePackTags(pack: SoundPack): string[] {
  const tags: string[] = [];

  const era = ERA_PREFIXES.find((e) => pack.id.startsWith(e.prefix));
  if (era) tags.push(era.label);

  if (pack.id.startsWith("plusxp") || pack.id.startsWith("plus95")) {
    tags.push("Plus!");
  }

  tags.push(ORIGIN_TAG_KEY[pack.origin]);

  return tags;
}

export function collectAllTags(packs: SoundPack[]): string[] {
  const set = new Set<string>();
  for (const pack of packs) {
    for (const tag of derivePackTags(pack)) set.add(tag);
  }
  return Array.from(set).sort();
}
