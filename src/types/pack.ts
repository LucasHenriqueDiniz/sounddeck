import type { PackEventAssignment } from "./soundEvent";

export type PackOrigin = "microsoft" | "community" | "sounddeck";

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
  description: string;
  cover: PackCoverArt;
  assignments: PackEventAssignment[];
  /** Attribution for where the source audio came from, shown in pack details. */
  sourceCredit?: string;
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
