import { invoke } from "@tauri-apps/api/core";
import { BACKUPS } from "../../mocks/backups";
import type { BackupEntry } from "../../types/backup";
import { isRunningInTauri } from "./windowsSoundService";

/**
 * Backups of the Windows sound scheme. Inside Tauri these are real: one JSON
 * file per backup under the app data dir, holding the raw registry value of
 * every event a pack apply touched (src-tauri/src/backups.rs). Outside Tauri
 * (`npm run dev` in a browser) there is no registry to snapshot, so the demo
 * list from src/mocks stands in.
 */

interface BackupSummaryDto {
  id: string;
  created_at: string;
  label: string;
  pack_name: string | null;
  event_count: number;
  size_bytes: number;
}

const LATENCY_MS = 350;

function delay<T>(value: T, ms = LATENCY_MS): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

let mockBackups: BackupEntry[] = [...BACKUPS];

export async function listBackups(): Promise<BackupEntry[]> {
  if (!isRunningInTauri()) return delay([...mockBackups]);

  const rows = await invoke<BackupSummaryDto[]>("list_backups");
  return rows.map((row) => ({
    id: row.id,
    createdAt: row.created_at,
    label: row.label,
    eventCount: row.event_count,
    sizeLabel: formatSize(row.size_bytes),
    restorable: row.event_count > 0,
  }));
}

export async function restoreBackup(
  id: string,
): Promise<{ ok: true } | { ok: false; message: string }> {
  if (!isRunningInTauri()) {
    await delay(undefined, 900);
    const entry = mockBackups.find((b) => b.id === id);
    if (!entry) return { ok: false, message: "error.backupNotFound" };
    if (!entry.restorable) return { ok: false, message: "error.backupNotRestorable" };
    return { ok: true };
  }

  try {
    await invoke<number>("restore_backup", { id });
    return { ok: true };
  } catch (error) {
    return { ok: false, message: String(error) };
  }
}

export async function deleteBackup(id: string): Promise<void> {
  if (!isRunningInTauri()) {
    mockBackups = mockBackups.filter((b) => b.id !== id);
    return;
  }
  await invoke("delete_backup", { id });
}

/** Demo-only: real backups are written by the Rust side during apply. */
export function pushBackup(entry: BackupEntry): void {
  mockBackups = [entry, ...mockBackups];
}
