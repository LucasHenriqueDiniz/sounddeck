import { useCallback, useRef, useState } from "react";
import type { ApplyOutcome, ApplyPhase } from "../../types/applyPack";
import type { SoundPack } from "../../types/pack";
import { playPackConfirmation } from "../../services/audio/packConfirmation";
import { runApplyPack, type ApplyPackHandle } from "../../services/tauri/applyPackService";

export type ApplyFlowPhase = "summary" | "running" | "success" | "recoverable-error" | "unrecoverable-error";

interface ApplyFlowState {
  phase: ApplyFlowPhase;
  progressPhase: ApplyPhase;
  progressValue: number;
  errorMessage?: string;
  errorDetail?: string;
}

const INITIAL: ApplyFlowState = { phase: "summary", progressPhase: "validating", progressValue: 0 };

export function useApplyPackFlow(onSuccess: () => void) {
  const [state, setState] = useState<ApplyFlowState>(INITIAL);
  const handleRef = useRef<ApplyPackHandle | null>(null);

  const start = useCallback(
    (pack: SoundPack, options?: { skipBackup?: boolean }) => {
      setState({ phase: "running", progressPhase: "validating", progressValue: 0 });
      const { promise, handle } = runApplyPack(
        pack,
        ({ phase, phaseProgress }) => {
          setState((prev) => ({ ...prev, progressPhase: phase, progressValue: phaseProgress }));
        },
        options,
      );
      handleRef.current = handle;

      promise.then((outcome: ApplyOutcome) => {
        if (outcome.status === "success") {
          setState((prev) => ({ ...prev, phase: "success" }));
          // Confirm by ear, with a sound from the scheme that was just
          // written — the fastest proof the change actually took.
          playPackConfirmation(pack);
          onSuccess();
        } else {
          setState((prev) => ({
            ...prev,
            phase: outcome.status,
            errorMessage: outcome.message,
            errorDetail: outcome.detail,
          }));
        }
      });
    },
    [onSuccess],
  );

  const cancel = useCallback(() => {
    handleRef.current?.cancel();
  }, []);

  const reset = useCallback(() => {
    setState(INITIAL);
  }, []);

  return { state, start, cancel, reset };
}
