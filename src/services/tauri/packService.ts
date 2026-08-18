import { CURRENT_APPLIED_PACK_ID, SOUND_PACKS } from "../../mocks/packs";
import type { SoundPack } from "../../types/pack";
import { fetchRemoteCatalog, getConfiguredCatalogBaseUrl } from "./remoteCatalogService";
import { listCustomPacks } from "./customPackService";

/**
 * Pack listing source. Real by default when VITE_PACKS_BASE_URL is
 * configured (fetches the actual catalog from R2 — see
 * remoteCatalogService.ts); falls back to the local demo packs
 * (src/mocks/packs.ts) otherwise, so the app still works out of the box
 * without any backend configured.
 *
 * There is still no Tauri command for "applied pack id" — that state (and
 * the artificial latency below) stays simulated regardless of which pack
 * source is active, since applying a pack for real isn't implemented yet.
 */

const LATENCY_MS = 420;

function delay<T>(value: T, ms = LATENCY_MS): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

let appliedPackId: string | null = CURRENT_APPLIED_PACK_ID;
let externallyChanged = false;

export async function listPacks(): Promise<SoundPack[]> {
  const baseUrl = getConfiguredCatalogBaseUrl();
  const basePacks = baseUrl ? await fetchRemoteCatalog(baseUrl) : await delay(SOUND_PACKS);
  // Custom packs are local-only (see customPackService.ts) and always shown
  // first, regardless of which base catalog is active.
  return [...listCustomPacks(), ...basePacks];
}

/**
 * Returns the last-known applied pack id regardless of drift — "externally
 * changed" (see isExternallyChanged) means that id can no longer be trusted
 * as current, not that it is unknown. Callers show both pieces of
 * information together (see AppShell's drift banner).
 */
export async function getAppliedPackId(): Promise<string | null> {
  return delay(appliedPackId, 120);
}

export function setAppliedPackId(id: string): void {
  appliedPackId = id;
  externallyChanged = false;
}

/** Demo-only affordance for exercising the "estado alterado externamente" state. */
export function simulateExternalChange(): void {
  externallyChanged = true;
}

export function isExternallyChanged(): boolean {
  return externallyChanged;
}

/** Acknowledges the drift and treats the last-applied pack as authoritative again. */
export function resyncAppliedState(): void {
  externallyChanged = false;
}
