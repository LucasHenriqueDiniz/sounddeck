import { useEffect, useState } from "react";
import { Dialog } from "../../components/Dialog";
import { Button } from "../../components/Button";
import { StatusBanner } from "../../components/StatusBanner";
import { Switch } from "../../components/Switch";
import { CheckIcon } from "../../components/icons/icons";
import type { SoundPack } from "../../types/pack";
import { buildApplySummary } from "../../services/tauri/applyPackService";
import { PackCoverArt } from "../packs/PackCoverArt";
import { useApplyPackFlow } from "./useApplyPackFlow";
import { ApplyProgress } from "./ApplyProgress";
import styles from "./ApplyPackDialog.module.css";
import { useT, type TranslationKey } from "../../i18n";

interface ApplyPackDialogProps {
  pack: SoundPack | null;
  open: boolean;
  onClose: () => void;
  onApplied: () => void;
}

export function ApplyPackDialog({ pack, open, onClose, onApplied }: ApplyPackDialogProps) {
  const t = useT();
  const { state, start, cancel, reset } = useApplyPackFlow(onApplied);
  const [createBackup, setCreateBackup] = useState(true);

  useEffect(() => {
    if (open) {
      reset();
      setCreateBackup(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, pack?.id]);

  if (!pack) return null;
  const summary = buildApplySummary(pack);
  const running = state.phase === "running";

  function handleClose() {
    if (running) return;
    onClose();
  }

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      preventDismiss={running}
      title={
        state.phase === "success"
          ? t("apply.applied")
          : state.phase === "recoverable-error" || state.phase === "unrecoverable-error"
            ? t("apply.failed")
            : t("apply.dialogTitle", { name: pack.name })
      }
      description={state.phase === "summary" ? t("apply.review") : undefined}
      footer={
        state.phase === "summary" ? (
          <>
            <Button variant="ghost" onClick={onClose}>
              {t("common.cancel")}
            </Button>
            <Button variant="primary" onClick={() => start(pack, { skipBackup: !createBackup })}>
              {t("pack.applyPack")}
            </Button>
          </>
        ) : state.phase === "running" ? (
          <Button variant="ghost" onClick={cancel}>
            {t("common.cancel")}
          </Button>
        ) : state.phase === "success" ? (
          <Button variant="primary" onClick={onClose}>
            {t("common.done")}
          </Button>
        ) : state.phase === "recoverable-error" ? (
          <>
            <Button variant="ghost" onClick={onClose}>
              {t("common.close")}
            </Button>
            <Button variant="primary" onClick={reset}>
              {t("common.tryAgain")}
            </Button>
          </>
        ) : (
          <Button variant="primary" onClick={onClose}>
            {t("common.close")}
          </Button>
        )
      }
    >
      {state.phase === "summary" && (
        <div className={styles.summary}>
          <div className={styles.hero}>
            <PackCoverArt cover={pack.cover} size="details" />
            <div className={styles.heroText}>
              <p className={styles.heroName}>{pack.name}</p>
              <p className={styles.heroMeta}>
                {[pack.author, pack.releaseYear].filter(Boolean).join(" · ")}
              </p>
            </div>
          </div>
          <ul className={styles.stats}>
            <li>
              <span className={`${styles.statValue} tabular-nums`}>{summary.totalEvents}</span>
              <span className={styles.statLabel}>{t("apply.eventsModified")}</span>
            </li>
            <li>
              <span className={`${styles.statValue} tabular-nums`}>{summary.usingPackSound}</span>
              <span className={styles.statLabel}>{t("apply.willUsePack")}</span>
            </li>
            <li>
              <span className={`${styles.statValue} tabular-nums`}>{summary.usingWindowsDefault}</span>
              <span className={styles.statLabel}>{t("apply.willKeepDefault")}</span>
            </li>
            <li>
              <span className={`${styles.statValue} tabular-nums`}>{summary.disabled}</span>
              <span className={styles.statLabel}>{t("apply.willDisable")}</span>
            </li>
          </ul>
          <StatusBanner
            severity={createBackup ? "info" : "warning"}
            title={createBackup ? t("apply.backupNotice.title") : t("apply.backupNotice.offTitle")}
            description={createBackup ? t("apply.backupNotice.desc") : t("apply.backupNotice.offDesc")}
            action={
              <Switch checked={createBackup} onChange={setCreateBackup} label={t("apply.backupToggle")} />
            }
          />
        </div>
      )}

      {state.phase === "running" && (
        <ApplyProgress currentPhase={state.progressPhase} currentPhaseProgress={state.progressValue} />
      )}

      {state.phase === "success" && (
        <div className={styles.result}>
          <div className={styles.successCover}>
            <PackCoverArt cover={pack.cover} size="details" />
            <span className={styles.successIcon}>
              <CheckIcon size={20} />
            </span>
          </div>
          <p className={styles.resultTitle}>{t("apply.successTitle", { name: pack.name })}</p>
          <p className={styles.resultDescription}>
            {t("apply.successDesc", { count: summary.usingPackSound })}
          </p>
        </div>
      )}

      {(state.phase === "recoverable-error" || state.phase === "unrecoverable-error") && (
        <div className={styles.result}>
          <p className={styles.resultTitle}>{state.errorMessage ? t(state.errorMessage as TranslationKey) : null}</p>
          <p className={styles.resultDescription}>
            {state.phase === "unrecoverable-error"
              ? t("apply.noPartial")
              : t("apply.noChanges")}
          </p>
          {state.errorDetail && <pre className={styles.detail}>{state.errorDetail}</pre>}
        </div>
      )}
    </Dialog>
  );
}
