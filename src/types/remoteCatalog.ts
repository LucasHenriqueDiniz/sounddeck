import type { PackCoverArt, PackOrigin } from "./pack";
import type { WindowsEventId } from "./soundEvent";

/**
 * Wire format for the remote pack catalog (catalog.json hosted alongside the
 * .wav files, e.g. in a public R2 bucket). Produced by
 * scripts/build-catalog.mjs, consumed by services/tauri/remoteCatalogService.ts.
 * Not wired into the running app yet — see that service's file header.
 */
export interface RemoteCatalogFile {
  eventId: WindowsEventId;
  /** File name only — resolved against `<baseUrl>/packs/<packId>/<fileName>`. */
  fileName: string;
  durationMs?: number;
}

export interface RemoteCatalogPack {
  id: string;
  name: string;
  author: string;
  origin: PackOrigin;
  releaseYear?: number;
  description: string;
  /** Present since the descriptions were keyed; older catalogs only have prose. */
  descriptionKey?: string;
  descriptionVars?: Record<string, string>;
  cover: PackCoverArt;
  /** Attribution for where the source audio came from, shown in pack details. */
  sourceCredit?: string;
  audioCreditKey?: string;
  audioCreditVars?: Record<string, string>;
  imageCreditKey?: string;
  imageCreditVars?: Record<string, string>;
  files: RemoteCatalogFile[];
}

export interface RemoteCatalog {
  generatedAt: string;
  packs: RemoteCatalogPack[];
}
