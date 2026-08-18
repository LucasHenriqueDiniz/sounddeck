import { BACKUPS } from "../../mocks/backups";
import type { BackupEntry } from "../../types/backup";

/**
 * DEMO DATA LAYER. No Tauri command exists yet to enumerate or restore
 * backups created during a pack apply — `creating-backup` in the apply flow
 * is currently simulated too (see applyPackService.ts). This mimics the
 * eventual shape of `list_backups` / `restore_backup` commands.
 */

const LATENCY_MS = 350;

function delay<T>(value: T, ms = LATENCY_MS): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

let backups: BackupEntry[] = [...BACKUPS];

export async function listBackups(): Promise<BackupEntry[]> {
  return delay([...backups]);
}

export async function restoreBackup(id: string): Promise<{ ok: true } | { ok: false; message: string }> {
  await delay(undefined, 900);
  const entry = backups.find((b) => b.id === id);
  if (!entry) {
    return { ok: false, message: "error.backupNotFound" };
  }
  if (!entry.restorable) {
    return { ok: false, message: "error.backupNotRestorable" };
  }
  return { ok: true };
}

export function pushBackup(entry: BackupEntry): void {
  backups = [entry, ...backups];
}
