import type { BackupEntry } from "../types/backup";

export const BACKUPS: BackupEntry[] = [
  {
    id: "bkp-2026-07-18",
    createdAt: "2026-07-18T09:14:00-03:00",
    label: "Before applying Windows 7",
    eventCount: 22,
    sizeLabel: "1.8 MB",
    restorable: true,
  },
  {
    id: "bkp-2026-06-02",
    createdAt: "2026-06-02T21:47:00-03:00",
    label: "Before applying Calm",
    eventCount: 22,
    sizeLabel: "2.1 MB",
    restorable: true,
  },
  {
    id: "bkp-2026-04-27",
    createdAt: "2026-04-27T14:03:00-03:00",
    label: "Before applying Windows XP",
    eventCount: 22,
    sizeLabel: "1.6 MB",
    restorable: true,
  },
  {
    id: "bkp-2026-02-11",
    createdAt: "2026-02-11T08:30:00-03:00",
    label: "Original system scheme",
    eventCount: 22,
    sizeLabel: "1.9 MB",
    restorable: false,
  },
];
