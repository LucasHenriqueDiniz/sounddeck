import { invoke, isTauri } from "@tauri-apps/api/core";
import type { SoundEvent } from "../../types/windowsSound";

/**
 * Read-only window onto the live Windows sound scheme. Writes never go
 * through here: they're batched into `apply_sound_pack` (see
 * applyPackService.ts) so a pack is applied atomically, behind a backup,
 * instead of one event at a time.
 *
 * `scanEvents` powers native-capability detection
 * (services/tauri/nativeCapability.ts) and the post-apply verification pass.
 */

export function isRunningInTauri(): boolean {
  return isTauri();
}

export async function scanEvents(): Promise<SoundEvent[]> {
  return invoke<SoundEvent[]>("scan_events");
}
