import { useState } from "react";
import { Dialog } from "../../components/Dialog";
import { Button } from "../../components/Button";
import { EmptyState } from "../../components/EmptyState";
import { ErrorState } from "../../components/ErrorState";
import { Skeleton } from "../../components/Skeleton";
import { StatusBanner } from "../../components/StatusBanner";
import { BackupsIcon } from "../../components/icons/icons";
import { useAppState } from "../../app/AppState";
import { resolveBackupLabel } from "../../types/backup";
import { useBackups } from "./useBackups";
import { BackupRow } from "./BackupRow";
import styles from "./BackupList.module.css";
import { useT, type TranslationKey } from "../../i18n";

export function BackupList() {
  const t = useT();
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
          <h1 className={styles.title}>{t("backups.title")}</h1>
          <p className={styles.subtitle}>{t("backups.subtitle")}</p>
        </div>
      </header>

      <div className={styles.content}>
        {restoreError && (
          <StatusBanner
            severity="danger"
            title={t("backups.restoreError")}
            description={restoreError ? t(restoreError as TranslationKey) : undefined}
          />
        )}
        {restoredId && (
          <StatusBanner
            severity="success"
            title={t("backups.restored.title")}
            description={t("backups.restored.desc")}
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
          <ErrorState title={t("backups.loadError")} detail={state.message} onRetry={reload} />
        )}

        {state.status === "success" && backups.length === 0 && (
          <EmptyState
            icon={<BackupsIcon size={32} />}
            title={t("backups.empty.title")}
            description={t("backups.empty.desc")}
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
        title={t("backups.confirm.title")}
        description={
          pending ? t("backups.confirm.desc", { label: resolveBackupLabel(pending, t) }) : undefined
        }
        footer={
          <>
            <Button variant="ghost" onClick={() => setPendingId(null)}>
              {t("common.cancel")}
            </Button>
            <Button variant="primary" onClick={confirmRestore}>
              {t("backups.restore")}
            </Button>
          </>
        }
      >
        <p style={{ font: "var(--text-sm)", color: "var(--text-secondary)" }}>
          {t("backups.confirm.warning")}
        </p>
      </Dialog>
    </div>
  );
}
