import { open } from "@tauri-apps/plugin-dialog";
import { isRunningInTauri } from "./windowsSoundService";

/**
 * Real integration: uses the already-installed `@tauri-apps/plugin-dialog`
 * to open the native file picker. This only returns a path the user
 * explicitly chose — SoundDeck does not read the file's contents (no
 * filesystem capability is granted for that), it just records the file name
 * against a pack event assignment for the (currently simulated) apply flow.
 */

const AUDIO_EXTENSIONS = ["wav"];

export type PickWavResult =
  | { status: "picked"; path: string; fileName: string }
  | { status: "cancelled" }
  | { status: "invalid"; reason: string }
  | { status: "unavailable" };

export async function pickReplacementWav(): Promise<PickWavResult> {
  if (!isRunningInTauri()) {
    return { status: "unavailable" };
  }

  const selection = await open({
    multiple: false,
    filters: [{ name: "Áudio (WAV)", extensions: AUDIO_EXTENSIONS }],
  });

  if (!selection || Array.isArray(selection)) {
    return { status: "cancelled" };
  }

  const fileName = selection.split(/[\\/]/).pop() ?? selection;
  const extension = fileName.split(".").pop()?.toLowerCase();
  if (!extension || !AUDIO_EXTENSIONS.includes(extension)) {
    return { status: "invalid", reason: "Selecione um arquivo .wav válido." };
  }

  return { status: "picked", path: selection, fileName };
}
