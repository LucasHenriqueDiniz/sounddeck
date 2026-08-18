import type { TranslationKey } from "../i18n";

export interface BackupEntry {
  id: string;
  createdAt: string;
  /** Name of the scheme/pack captured by this backup — resolved with useT() at the display site. */
  labelKey: TranslationKey;
  labelVars?: Record<string, string | number>;
  eventCount: number;
  sizeLabel: string;
  restorable: boolean;
}
