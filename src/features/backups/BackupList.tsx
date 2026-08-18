import { useState } from "react";
import { Dialog } from "../../components/Dialog";
import { Button } from "../../components/Button";
import { EmptyState } from "../../components/EmptyState";
import { ErrorState } from "../../components/ErrorState";
import { Skeleton } from "../../components/Skeleton";
import { StatusBanner } from "../../components/StatusBanner";
import { BackupsIcon } from "../../components/icons/icons";
import { useAppState } from "../../app/AppState";
import { useBackups } from "./useBackups";
import { BackupRow } from "./BackupRow";
import styles from "./BackupList.module.css";

export function BackupList() {
  const { backupsVersion } = useAppState();
  const { state, reload, restore, restoringId, restoreError, restoredId, clearRestoredId } =
    useBackups(backupsVersion);
  const [pendingId, setPendingId] = useState<string | null>(null);

  const backups = state.status === "success" ? state.data : [];
  const pending = backups.find((b) => b.id === pendingId) ?? null;

  async function confirmRestore() {
    if (!pendingId) return;
    const id = pendingId;
    setPendingId(null);
    await restore(id);
  }

  return (
    <div className={styles.wrapper}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Backups</h1>
          <p className={styles.subtitle}>Snapshots taken automatically before every pack you apply.</p>
        </div>
      </header>

      <div className={styles.content}>
        {restoreError && (
          <StatusBanner
            severity="danger"
            title="Could not restore the backup"
            description={restoreError}
          />
        )}
        {restoredId && (
          <StatusBanner
            severity="success"
            title="Backup restored"
            description="The previous sound scheme has been reapplied."
            onDismiss={clearRestoredId}
          />
        )}

        {state.status === "loading" && (
          <div className={styles.list}>
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} style={{ padding: "12px 16px" }}>
                <Skeleton height={14} width="40%" />
                <div style={{ height: 6 }} />
                <Skeleton height={11} width="60%" />
              </div>
            ))}
          </div>
        )}

        {state.status === "error" && (
          <ErrorState title="Could not load the backups" detail={state.message} onRetry={reload} />
        )}

        {state.status === "success" && backups.length === 0 && (
          <EmptyState
            icon={<BackupsIcon size={32} />}
            title="No backups yet"
            description="Backups are created automatically whenever you apply a pack."
          />
        )}

        {state.status === "success" && backups.length > 0 && (
          <div className={styles.list}>
            {backups.map((backup) => (
              <BackupRow
                key={backup.id}
                backup={backup}
                busy={restoringId === backup.id}
                restored={restoredId === backup.id}
                onRestore={() => setPendingId(backup.id)}
              />
            ))}
          </div>
        )}
      </div>

      <Dialog
        open={pending !== null}
        onClose={() => setPendingId(null)}
        title="Restore this backup?"
        description={pending ? `"${pending.label}" will replace the current Windows sound scheme.` : undefined}
        footer={
          <>
            <Button variant="ghost" onClick={() => setPendingId(null)}>
              Cancelar
            </Button>
            <Button variant="primary" onClick={confirmRestore}>
              Restore
            </Button>
          </>
        }
      >
        <p style={{ font: "var(--text-sm)", color: "var(--text-secondary)" }}>
          This action cannot be undone automatically — restore another backup if you need to go back.
        </p>
      </Dialog>
    </div>
  );
}
