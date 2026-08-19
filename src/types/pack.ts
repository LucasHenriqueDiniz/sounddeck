import type { TranslationKey } from "../i18n";
import type { PackEventAssignment } from "./soundEvent";

export type PackOrigin = "microsoft" | "community" | "sounddeck" | "custom";

export interface PackCoverArt {
  /** Two-stop gradient used as the cover surface — also the fallback if `imageUrl` fails to load. */
  gradientFrom: string;
  gradientTo: string;
  /** Single glyph/initial rendered over the gradient (hidden when a real image is showing). */
  glyph: string;
  /**
   * Optional real cover photo. For remote-catalog packs this is a filename
   * resolved the same way as audio files (`resolvePackFileUrl`); always a
   * freely-licensed or original image — never a trademarked logo/wallpaper,
   * see DESIGN.md.
   */
  imageUrl?: string;
}

export interface SoundPack {
  id: string;
  name: string;
  author: string;
  origin: PackOrigin;
  releaseYear?: number;
  /**
   * Literal fallback text. Catalog packs also carry `descriptionKey`, which
   * takes precedence — prefer `resolvePackDescription` over reading this.
   */
  description: string;
  /**
   * Translation key for the description, with `descriptionVars` as its
   * interpolation values. Catalog descriptions come from a handful of fixed
   * templates, so they're stored as a key rather than prose: the same pack
   * then reads correctly in every UI language instead of only Portuguese.
   */
  descriptionKey?: string;
  descriptionVars?: Record<string, string>;
  cover: PackCoverArt;
  assignments: PackEventAssignment[];
  /**
   * Literal fallback credit. Prefer `resolvePackCredit` — catalog packs carry
   * the keyed pair below.
   */
  sourceCredit?: string;
  /** Where the audio came from. */
  audioCreditKey?: string;
  audioCreditVars?: Record<string, string>;
  /** Where the cover image came from, including any trademark note. */
  imageCreditKey?: string;
  imageCreditVars?: Record<string, string>;
  /**
   * Set only for packs loaded from the real remote catalog — lets preview
   * controls stream the actual file instead of a synthesized stand-in tone.
   * Demo/mock packs leave this undefined on purpose (their `fileName`s don't
   * correspond to any real file).
   */
  remoteBaseUrl?: string;
}

export interface PackSummary {
  pack: SoundPack;
  soundCount: number;
  isApplied: boolean;
}

/**
 * Falls back to the literal `description` when there's no key: custom packs
 * carry prose the user effectively authored, and a catalog published before
 * descriptions were keyed still has only prose.
 */
export function resolvePackDescription(
  pack: SoundPack,
  t: (key: TranslationKey, vars?: Record<string, string | number>) => string,
): string {
  if (!pack.descriptionKey) return pack.description;
  // The key comes from remote catalog data, so it isn't provably a
  // TranslationKey — `t` echoes unknown keys back, and that echo is what the
  // fallback below detects.
  const translated = t(pack.descriptionKey as TranslationKey, pack.descriptionVars);
  return translated === pack.descriptionKey ? pack.description : translated;
}

/**
 * Joins the audio and cover-image attributions the way the catalog used to
 * store them pre-joined. Falls back to the literal `sourceCredit` when a pack
 * predates the keyed fields — a credit is a legal-ish statement, so showing
 * the stale prose beats showing nothing.
 */
export function resolvePackCredit(
  pack: SoundPack,
  t: (key: TranslationKey, vars?: Record<string, string | number>) => string,
): string | undefined {
  const translate = (key?: string, vars?: Record<string, string>) => {
    if (!key) return undefined;
    const text = t(key as TranslationKey, vars);
    return text === key ? undefined : text;
  };

  const parts = [
    translate(pack.audioCreditKey, pack.audioCreditVars),
    translate(pack.imageCreditKey, pack.imageCreditVars),
  ].filter(Boolean);

  return parts.length > 0 ? parts.join(" · ") : pack.sourceCredit;
}
