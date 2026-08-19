import { invoke } from "@tauri-apps/api/core";
import { isRunningInTauri } from "./windowsSoundService";

/**
 * Wrapper around the `download_pack_asset` Tauri command
 * (src-tauri/src/pack_download.rs), used by the apply flow to pull a catalog
 * pack's audio down before writing it into the registry. Previews stream
 * straight from the remote URL instead, so this is the only path that puts
 * catalog audio on disk.
 *
 * The Rust side enforces the real safety boundary (https-only, allow-listed
 * host, no path traversal, .wav-only) — this wrapper doesn't duplicate that
 * logic, just exposes it with a typed, honest failure mode outside Tauri.
 */
export async function downloadPackAsset(
  url: string,
  packId: string,
  fileName: string,
): Promise<{ status: "downloaded"; path: string } | { status: "unavailable" } | { status: "error"; message: string }> {
  if (!isRunningInTauri()) {
    return { status: "unavailable" };
  }
  try {
    const path = await invoke<string>("download_pack_asset", { url, packId, fileName });
    return { status: "downloaded", path };
  } catch (error) {
    return { status: "error", message: String(error) };
  }
}
