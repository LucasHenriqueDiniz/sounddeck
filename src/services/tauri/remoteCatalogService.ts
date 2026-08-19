import type { RemoteCatalog } from "../../types/remoteCatalog";
import type { SoundPack } from "../../types/pack";
import { SOUND_EVENT_CATALOG } from "../../mocks/soundEventCatalog";
import { eventKey } from "../../types/soundEvent";

/**
 * Fetches catalog.json from the public R2 bucket (produced by
 * scripts/build-catalog.mjs, uploaded by scripts/upload-catalog.mjs) and
 * maps it to the app's internal SoundPack shape. Wired into packService.ts
 * as the primary pack source whenever VITE_PACKS_BASE_URL is configured.
 *
 * The base URL is never hardcoded — it comes from build-time configuration,
 * so this module can't silently point at a placeholder that looks real.
 */

export function getConfiguredCatalogBaseUrl(): string | null {
  const url = import.meta.env.VITE_PACKS_BASE_URL;
  return typeof url === "string" && url.length > 0 ? url : null;
}

export async function fetchRemoteCatalog(baseUrl: string): Promise<SoundPack[]> {
  const response = await fetch(`${baseUrl}/catalog.json`);
  if (!response.ok) {
    throw new Error(`Failed to fetch the remote catalog: HTTP ${response.status}`);
  }
  const catalog = (await response.json()) as RemoteCatalog;
  return catalog.packs.map((pack) => {
    const providedKeys = new Map(pack.files.map((f) => [eventKey(f.eventId), f]));
    const assignments = SOUND_EVENT_CATALOG.map((meta) => {
      const provided = providedKeys.get(eventKey(meta.id));
      if (provided) {
        return {
          eventId: meta.id,
          state: "pack" as const,
          fileName: provided.fileName,
          durationMs: provided.durationMs,
        };
      }
      return { eventId: meta.id, state: "default" as const };
    });

    return {
      id: pack.id,
      name: pack.name,
      author: pack.author,
      origin: pack.origin,
      releaseYear: pack.releaseYear,
      description: pack.description,
      descriptionKey: pack.descriptionKey,
      descriptionVars: pack.descriptionVars,
      cover: pack.cover.imageUrl
        ? { ...pack.cover, imageUrl: resolvePackFileUrl(baseUrl, pack.id, pack.cover.imageUrl) }
        : pack.cover,
      assignments,
      sourceCredit: pack.sourceCredit,
      audioCreditKey: pack.audioCreditKey,
      audioCreditVars: pack.audioCreditVars,
      imageCreditKey: pack.imageCreditKey,
      imageCreditVars: pack.imageCreditVars,
      remoteBaseUrl: baseUrl,
    } satisfies SoundPack;
  });
}

export function resolvePackFileUrl(baseUrl: string, packId: string, fileName: string): string {
  return `${baseUrl}/packs/${encodeURIComponent(packId)}/${encodeURIComponent(fileName)}`;
}
