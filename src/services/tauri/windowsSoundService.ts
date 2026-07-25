import { invoke, isTauri } from "@tauri-apps/api/core";
import type { EventSnapshot, SoundEvent } from "../../types/windowsSound";

/**
 * Thin, typed wrappers around the three real Tauri commands exposed by
 * src-tauri/src/lib.rs. This is the only layer in the app that touches the
 * live Windows registry.
 *
 * NOTE: nothing in the pack/apply/backup UI calls these yet. Each command
 * mutates a single event immediately with no batching, summary, or backup —
 * wiring it directly into per-row editor controls would apply changes to the
 * real system without the governed review-then-apply flow the product
 * requires. They are connected and callable, but intentionally not invoked
 * by the current screens. `scanEvents` (read-only) is the exception: it
 * powers native-capability detection in services/tauri/nativeCapability.ts.
 */

export function isRunningInTauri(): boolean {
  return isTauri();
}

export async function scanEvents(): Promise<SoundEvent[]> {
  return invoke<SoundEvent[]>("scan_events");
}

export async function applyTestSound(
  app: string,
  event: string,
  wavPath: string,
): Promise<EventSnapshot> {
  return invoke<EventSnapshot>("apply_test_sound", { app, event, wavPath });
}

export async function restoreSound(snapshot: EventSnapshot): Promise<void> {
  await invoke("restore_sound", { snapshot });
}
