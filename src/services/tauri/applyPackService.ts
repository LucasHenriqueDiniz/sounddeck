import { APPLY_PHASE_ORDER } from "../../types/applyPack";
import type { ApplyOutcome, ApplyPhase, ApplySummary } from "../../types/applyPack";
import type { SoundPack } from "../../types/pack";
import { pushBackup } from "./backupService";
import { setAppliedPackId } from "./packService";

/**
 * DEMO DATA LAYER. There is no bulk-apply Tauri command yet — the Rust side
 * only exposes single-event apply/restore (`apply_test_sound`,
 * `restore_sound`, see windowsSoundService.ts), with no batching, backup
 * creation, or verification pass. This module simulates the full phased
 * flow described in the product spec so the review → apply → progress →
 * result UI is fully implemented and testable, without pretending any real
 * registry write happens.
 *
 * Pending real integration: a single `apply_sound_pack(packId, options)`
 * command that performs validation, backup, file copy, registry writes and
 * verification server-side, streaming phase progress back to the frontend.
 */

export function buildApplySummary(pack: SoundPack): ApplySummary {
  let usingPackSound = 0;
  let usingWindowsDefault = 0;
  let disabled = 0;

  for (const assignment of pack.assignments) {
    if (assignment.state === "pack") usingPackSound += 1;
    else if (assignment.state === "default") usingWindowsDefault += 1;
    else disabled += 1;
  }

  return {
    packName: pack.name,
    totalEvents: pack.assignments.length,
    usingPackSound,
    usingWindowsDefault,
    disabled,
    willCreateBackup: true,
  };
}

const PHASE_DURATION_MS: Record<ApplyPhase, number> = {
  validating: 500,
  "creating-backup": 700,
  "processing-audio": 900,
  "copying-files": 900,
  "writing-registry": 700,
  verifying: 500,
  complete: 0,
};

export interface ApplyPackHandle {
  cancel: () => void;
}

/**
 * Simulates the apply pipeline, invoking `onProgress` as each phase moves,
 * and resolves with the final outcome. A pack id of "force-error-demo" is a
 * deliberate escape hatch reserved for manual QA of the error states — no
 * production pack uses it.
 */
export function runApplyPack(
  pack: SoundPack,
  onProgress: (state: { phase: ApplyPhase; phaseProgress: number }) => void,
): { promise: Promise<ApplyOutcome>; handle: ApplyPackHandle } {
  let cancelled = false;
  const handle: ApplyPackHandle = {
    cancel: () => {
      cancelled = true;
    },
  };

  const promise = (async (): Promise<ApplyOutcome> => {
    for (const phase of APPLY_PHASE_ORDER) {
      const duration = PHASE_DURATION_MS[phase];
      const steps = Math.max(1, Math.round(duration / 90));
      for (let step = 1; step <= steps; step += 1) {
        if (cancelled) {
          return { status: "recoverable-error", message: "Aplicação cancelada pelo usuário." };
        }
        await new Promise((resolve) => setTimeout(resolve, duration / steps));
        onProgress({ phase, phaseProgress: step / steps });
      }

      if (phase === "writing-registry" && pack.id === "force-error-demo") {
        return {
          status: "unrecoverable-error",
          message: "Não foi possível gravar as configurações do Windows.",
          detail: "ERROR_ACCESS_DENIED ao escrever em HKCU\\AppEvents\\Schemes\\Apps",
        };
      }
    }

    pushBackup({
      id: `bkp-${Date.now()}`,
      createdAt: new Date().toISOString(),
      label: `Antes de aplicar ${pack.name}`,
      eventCount: pack.assignments.length,
      sizeLabel: "2,0 MB",
      restorable: true,
    });
    setAppliedPackId(pack.id);

    return { status: "success" };
  })();

  return { promise, handle };
}
