import { Badge } from "../../components/Badge";
import { Button } from "../../components/Button";
import { UndoIcon } from "../../components/icons/icons";
import { formatDateTime } from "../../lib/format";
import type { BackupEntry } from "../../types/backup";
import styles from "./BackupRow.module.css";

interface BackupRowProps {
  backup: BackupEntry;
  busy: boolean;
  restored: boolean;
  onRestore: () => void;
}

export function BackupRow({ backup, busy, restored, onRestore }: BackupRowProps) {
  return (
    <div className={styles.row}>
      <div className={styles.info}>
        <p className={styles.label}>{backup.label}</p>
        <p className={styles.meta}>
          {formatDateTime(backup.createdAt)} · {backup.eventCount} events · {backup.sizeLabel}
        </p>
      </div>

      {restored && (
        <Badge variant="success" icon={<UndoIcon size={12} />}>
          Restaurado
        </Badge>
      )}

      {!backup.restorable ? (
        <Badge variant="neutral">Not restorable</Badge>
      ) : (
        <Button variant="secondary" size="sm" icon={<UndoIcon size={14} />} loading={busy} onClick={onRestore}>
          Restore
        </Button>
      )}
    </div>
  );
}
