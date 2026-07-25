export interface BackupEntry {
  id: string;
  createdAt: string;
  /** Name of the scheme/pack captured by this backup. */
  label: string;
  eventCount: number;
  sizeLabel: string;
  restorable: boolean;
}
