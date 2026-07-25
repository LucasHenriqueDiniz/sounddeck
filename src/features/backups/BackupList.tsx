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
          <p className={styles.subtitle}>Snapshots criados automaticamente antes de cada aplicação de pack.</p>
        </div>
      </header>

      <div className={styles.content}>
        {restoreError && (
          <StatusBanner
            severity="danger"
            title="Não foi possível restaurar o backup"
            description={restoreError}
          />
        )}
        {restoredId && (
          <StatusBanner
            severity="success"
            title="Backup restaurado com sucesso"
            description="O esquema de sons anterior foi reaplicado."
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
          <ErrorState title="Não foi possível carregar os backups" detail={state.message} onRetry={reload} />
        )}

        {state.status === "success" && backups.length === 0 && (
          <EmptyState
            icon={<BackupsIcon size={32} />}
            title="Nenhum backup ainda"
            description="Backups são criados automaticamente sempre que você aplica um pack."
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
        title="Restaurar este backup?"
        description={pending ? `"${pending.label}" substituirá o esquema de sons atual do Windows.` : undefined}
        footer={
          <>
            <Button variant="ghost" onClick={() => setPendingId(null)}>
              Cancelar
            </Button>
            <Button variant="primary" onClick={confirmRestore}>
              Restaurar
            </Button>
          </>
        }
      >
        <p style={{ font: "var(--text-sm)", color: "var(--text-secondary)" }}>
          Essa ação não pode ser desfeita automaticamente — restaure novamente outro backup se precisar
          voltar atrás.
        </p>
      </Dialog>
    </div>
  );
}
