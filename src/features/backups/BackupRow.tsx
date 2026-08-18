import { Badge } from "../../components/Badge";
import { Button } from "../../components/Button";
import { UndoIcon } from "../../components/icons/icons";
import { formatDateTime } from "../../lib/format";
import type { BackupEntry } from "../../types/backup";
import styles from "./BackupRow.module.css";
import { useT } from "../../i18n";

interface BackupRowProps {
  backup: BackupEntry;
  busy: boolean;
  restored: boolean;
  onRestore: () => void;
}

export function BackupRow({ backup, busy, restored, onRestore }: BackupRowProps) {
  const t = useT();
  return (
    <div className={styles.row}>
      <div className={styles.info}>
        <p className={styles.label}>{t(backup.labelKey, backup.labelVars)}</p>
        <p className={styles.meta}>
          {formatDateTime(backup.createdAt)} · {t("backups.eventCount", { count: backup.eventCount })} · {backup.sizeLabel}
        </p>
      </div>

      {restored && (
        <Badge variant="success" icon={<UndoIcon size={12} />}>
          {t("backups.restoredBadge")}
        </Badge>
      )}

      {!backup.restorable ? (
        <Badge variant="neutral">{t("backups.notRestorable")}</Badge>
      ) : (
        <Button variant="secondary" size="sm" icon={<UndoIcon size={14} />} loading={busy} onClick={onRestore}>
          {t("backups.restore")}
        </Button>
      )}
    </div>
  );
}
