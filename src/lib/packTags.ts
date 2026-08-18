import type { SoundPack } from "../types/pack";

/**
 * Tags are derived purely from fields already in SoundPack (id prefix,
 * origin) — no catalog.json change or re-upload needed. Order matters only
 * in that more specific prefixes should be checked first; ties resolve to
 * the same label here, so it isn't load-bearing today.
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

const ORIGIN_TAG: Record<SoundPack["origin"], string> = {
  microsoft: "Official",
  community: "Community",
  sounddeck: "SoundDeck",
};

export function derivePackTags(pack: SoundPack): string[] {
  const tags: string[] = [];

  const era = ERA_PREFIXES.find((e) => pack.id.startsWith(e.prefix));
  if (era) tags.push(era.label);

  if (pack.id.startsWith("plusxp") || pack.id.startsWith("plus95")) {
    tags.push("Plus!");
  }

  tags.push(ORIGIN_TAG[pack.origin]);

  return tags;
}

export function collectAllTags(packs: SoundPack[]): string[] {
  const set = new Set<string>();
  for (const pack of packs) {
    for (const tag of derivePackTags(pack)) set.add(tag);
  }
  return Array.from(set).sort();
}
