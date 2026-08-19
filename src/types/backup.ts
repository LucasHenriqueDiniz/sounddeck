import type { TranslationKey } from "../i18n";

export interface BackupEntry {
  id: string;
  createdAt: string;
  /** Literal label, as stored on disk by a real backup. */
  label?: string;
  /** Translation key — demo backups only; real ones carry `label` instead. */
  labelKey?: TranslationKey;
  labelVars?: Record<string, string | number>;
  eventCount: number;
  sizeLabel: string;
  restorable: boolean;
}

export function resolveBackupLabel(
  backup: BackupEntry,
  t: (key: TranslationKey, vars?: Record<string, string | number>) => string,
): string {
  if (backup.label) return backup.label;
  return backup.labelKey ? t(backup.labelKey, backup.labelVars) : "";
}
