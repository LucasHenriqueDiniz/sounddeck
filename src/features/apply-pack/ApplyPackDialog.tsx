import { useEffect } from "react";
import { Dialog } from "../../components/Dialog";
import { Button } from "../../components/Button";
import { StatusBanner } from "../../components/StatusBanner";
import { CheckIcon } from "../../components/icons/icons";
import type { SoundPack } from "../../types/pack";
import { buildApplySummary } from "../../services/tauri/applyPackService";
import { useApplyPackFlow } from "./useApplyPackFlow";
import { ApplyProgress } from "./ApplyProgress";
import styles from "./ApplyPackDialog.module.css";

interface ApplyPackDialogProps {
  pack: SoundPack | null;
  open: boolean;
  onClose: () => void;
  onApplied: () => void;
}

export function ApplyPackDialog({ pack, open, onClose, onApplied }: ApplyPackDialogProps) {
  const { state, start, cancel, reset } = useApplyPackFlow(onApplied);

  useEffect(() => {
    if (open) reset();
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
          ? "Pack aplicado"
          : state.phase === "recoverable-error" || state.phase === "unrecoverable-error"
            ? "Não foi possível aplicar o pack"
            : `Aplicar "${pack.name}"`
      }
      description={state.phase === "summary" ? "Revise as alterações antes de continuar." : undefined}
      footer={
        state.phase === "summary" ? (
          <>
            <Button variant="ghost" onClick={onClose}>
              Cancelar
            </Button>
            <Button variant="primary" onClick={() => start(pack)}>
              Aplicar pack
            </Button>
          </>
        ) : state.phase === "running" ? (
          <Button variant="ghost" onClick={cancel}>
            Cancelar
          </Button>
        ) : state.phase === "success" ? (
          <Button variant="primary" onClick={onClose}>
            Concluir
          </Button>
        ) : state.phase === "recoverable-error" ? (
          <>
            <Button variant="ghost" onClick={onClose}>
              Fechar
            </Button>
            <Button variant="primary" onClick={reset}>
              Tentar novamente
            </Button>
          </>
        ) : (
          <Button variant="primary" onClick={onClose}>
            Fechar
          </Button>
        )
      }
    >
      {state.phase === "summary" && (
        <div className={styles.summary}>
          <ul className={styles.stats}>
            <li>
              <span className={`${styles.statValue} tabular-nums`}>{summary.totalEvents}</span>
              <span className={styles.statLabel}>eventos modificados</span>
            </li>
            <li>
              <span className={`${styles.statValue} tabular-nums`}>{summary.usingPackSound}</span>
              <span className={styles.statLabel}>usarão sons do pack</span>
            </li>
            <li>
              <span className={`${styles.statValue} tabular-nums`}>{summary.usingWindowsDefault}</span>
              <span className={styles.statLabel}>manterão o padrão do Windows</span>
            </li>
            <li>
              <span className={`${styles.statValue} tabular-nums`}>{summary.disabled}</span>
              <span className={styles.statLabel}>serão desativados</span>
            </li>
          </ul>
          <StatusBanner
            severity="info"
            title="Um backup do esquema atual será criado automaticamente"
            description="Você poderá restaurá-lo a qualquer momento em Backups."
          />
        </div>
      )}

      {state.phase === "running" && (
        <ApplyProgress currentPhase={state.progressPhase} currentPhaseProgress={state.progressValue} />
      )}

      {state.phase === "success" && (
        <div className={styles.result}>
          <div className={styles.successIcon}>
            <CheckIcon size={22} />
          </div>
          <p className={styles.resultTitle}>{`"${pack.name}" foi aplicado com sucesso`}</p>
          <p className={styles.resultDescription}>
            {summary.usingPackSound} sons foram atualizados. O esquema anterior foi salvo em Backups.
          </p>
        </div>
      )}

      {(state.phase === "recoverable-error" || state.phase === "unrecoverable-error") && (
        <div className={styles.result}>
          <p className={styles.resultTitle}>{state.errorMessage}</p>
          <p className={styles.resultDescription}>
            {state.phase === "unrecoverable-error"
              ? "Nenhuma alteração parcial foi mantida. Verifique a área de Backups se precisar restaurar algo."
              : "Nenhuma alteração foi aplicada. Você pode tentar novamente."}
          </p>
          {state.errorDetail && <pre className={styles.detail}>{state.errorDetail}</pre>}
        </div>
      )}
    </Dialog>
  );
}
