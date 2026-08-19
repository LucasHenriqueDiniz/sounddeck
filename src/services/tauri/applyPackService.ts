import { invoke } from "@tauri-apps/api/core";
import { APPLY_PHASE_ORDER } from "../../types/applyPack";
import type { ApplyOutcome, ApplyPhase, ApplySummary } from "../../types/applyPack";
import type { SoundPack } from "../../types/pack";
import type { PackEventAssignment } from "../../types/soundEvent";
import { pushBackup } from "./backupService";
import { downloadPackAsset } from "./packDownloadService";
import { setAppliedPackId } from "./packService";
import { resolvePackFileUrl } from "./remoteCatalogService";
import { isRunningInTauri, scanEvents } from "./windowsSoundService";

/**
 * Applies a pack to the live Windows sound scheme.
 *
 * Inside Tauri this is real: pack audio is downloaded to the app data dir,
 * every affected event is snapshotted into a backup, and the registry is
 * written in one batched Rust call that rolls back on failure. Outside Tauri
 * there is no registry, so the browser dev build falls through to the
 * simulation at the bottom of this file — the UI is identical either way.
 */

interface ApplyEntryDto {
  app: string;
  event: string;
  action: "pack" | "default" | "disabled";
  wav_path: string | null;
}

interface ApplyPackResultDto {
  applied: number;
  backup_id: string | null;
}

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

export interface ApplyPackHandle {
  cancel: () => void;
}

type ProgressFn = (state: { phase: ApplyPhase; phaseProgress: number }) => void;

class CancelledError extends Error {}

/**
 * Resolves an assignment to an absolute .wav path on this machine. Files the
 * user picked themselves already carry one; catalog packs stream their audio
 * straight from R2 for previews and only get downloaded here, at apply time.
 */
async function resolveWavPath(
  pack: SoundPack,
  assignment: PackEventAssignment,
): Promise<string> {
  if (assignment.filePath) return assignment.filePath;

  const fileName = assignment.fileName;
  if (!fileName) {
    throw new Error(`Missing file for ${assignment.eventId.app}\\${assignment.eventId.event}`);
  }
  if (!pack.remoteBaseUrl) {
    throw new Error(`"${pack.name}" has no downloadable audio for ${fileName}.`);
  }

  // A sound borrowed from another pack lives under that pack's prefix in the
  // bucket; resolving it against the pack being applied would 404.
  const ownerId = assignment.sourcePackId ?? pack.id;
  const url = resolvePackFileUrl(pack.remoteBaseUrl, ownerId, fileName);
  const result = await downloadPackAsset(url, ownerId, fileName);
  if (result.status !== "downloaded") {
    throw new Error(
      result.status === "error" ? result.message : "Download unavailable outside the desktop app.",
    );
  }
  return result.path;
}

async function runRealApply(
  pack: SoundPack,
  onProgress: ProgressFn,
  options: { skipBackup?: boolean },
  isCancelled: () => boolean,
): Promise<ApplyOutcome> {
  const checkCancelled = () => {
    if (isCancelled()) throw new CancelledError();
  };

  onProgress({ phase: "validating", phaseProgress: 0.3 });

  // A pack's assignments come from the app's own event catalog, which is a
  // superset of what any given machine actually registers. Writing an event
  // Windows doesn't have would *create* it, inventing registry keys for apps
  // the user may not even have installed — so only touch what's really there.
  const live = await scanEvents();
  const liveKeys = new Set(live.map((e) => `${e.app}\\${e.event}`));
  const applicable = pack.assignments.filter((a) =>
    liveKeys.has(`${a.eventId.app}\\${a.eventId.event}`),
  );
  if (applicable.length === 0) {
    throw new Error("None of this pack's events exist in the Windows registry.");
  }
  onProgress({ phase: "validating", phaseProgress: 1 });
  checkCancelled();

  const packAssignments = applicable.filter((a) => a.state === "pack");
  const entries: ApplyEntryDto[] = [];
  const resolvedPaths = new Map<string, string>();

  // Downloads are the only slow, cancellable part, so they carry the real
  // progress; everything after this point is a single fast registry pass.
  let done = 0;
  for (const assignment of packAssignments) {
    checkCancelled();
    onProgress({
      phase: "copying-files",
      phaseProgress: packAssignments.length === 0 ? 1 : done / packAssignments.length,
    });
    const path = await resolveWavPath(pack, assignment);
    resolvedPaths.set(`${assignment.eventId.app}\\${assignment.eventId.event}`, path);
    done += 1;
  }
  onProgress({ phase: "copying-files", phaseProgress: 1 });
  checkCancelled();

  for (const assignment of applicable) {
    const key = `${assignment.eventId.app}\\${assignment.eventId.event}`;
    entries.push({
      app: assignment.eventId.app,
      event: assignment.eventId.event,
      action: assignment.state,
      wav_path: assignment.state === "pack" ? (resolvedPaths.get(key) ?? null) : null,
    });
  }

  onProgress({ phase: "creating-backup", phaseProgress: 1 });
  checkCancelled();

  // Past here the registry write is in flight and cancellation is no longer
  // safe — Rust owns atomicity (it rolls back on partial failure).
  onProgress({ phase: "writing-registry", phaseProgress: 0.1 });
  const result = await invoke<ApplyPackResultDto>("apply_sound_pack", {
    entries,
    createBackup: !options.skipBackup,
    backupLabel: `Before applying ${pack.name}`,
    packName: pack.name,
    createdAt: new Date().toISOString(),
  });
  onProgress({ phase: "writing-registry", phaseProgress: 1 });

  // Read the registry back rather than trusting the write — this is what
  // makes the "verifying" step mean something.
  onProgress({ phase: "verifying", phaseProgress: 0.4 });
  const afterApply = await scanEvents();
  const liveByKey = new Map(afterApply.map((e) => [`${e.app}\\${e.event}`, e.current_sound]));
  const mismatches = entries.filter(
    (entry) =>
      entry.action === "pack" && liveByKey.get(`${entry.app}\\${entry.event}`) !== entry.wav_path,
  );
  onProgress({ phase: "verifying", phaseProgress: 1 });

  if (mismatches.length > 0) {
    return {
      status: "recoverable-error",
      message: "error.applyVerifyFailed",
      detail: mismatches
        .slice(0, 5)
        .map((m) => `${m.app}\\${m.event}`)
        .join(", "),
    };
  }

  setAppliedPackId(pack.id);
  onProgress({ phase: "complete", phaseProgress: 1 });
  return { status: "success", appliedCount: result.applied };
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

async function runSimulatedApply(
  pack: SoundPack,
  onProgress: ProgressFn,
  options: { skipBackup?: boolean },
  isCancelled: () => boolean,
): Promise<ApplyOutcome> {
  const phases = options.skipBackup
    ? APPLY_PHASE_ORDER.filter((phase) => phase !== "creating-backup")
    : APPLY_PHASE_ORDER;

  for (const phase of phases) {
    const duration = PHASE_DURATION_MS[phase];
    const steps = Math.max(1, Math.round(duration / 90));
    for (let step = 1; step <= steps; step += 1) {
      if (isCancelled()) {
        return { status: "recoverable-error", message: "error.applyCancelled" };
      }
      await new Promise((resolve) => setTimeout(resolve, duration / steps));
      onProgress({ phase, phaseProgress: step / steps });
    }

    if (phase === "writing-registry" && pack.id === "force-error-demo") {
      return {
        status: "unrecoverable-error",
        message: "error.registryWrite",
        detail: "ERROR_ACCESS_DENIED writing to HKCU\\AppEvents\\Schemes\\Apps",
      };
    }
  }

  if (!options.skipBackup) {
    pushBackup({
      id: `bkp-${Date.now()}`,
      createdAt: new Date().toISOString(),
      labelKey: "backups.autoLabel",
      labelVars: { name: pack.name },
      eventCount: pack.assignments.length,
      sizeLabel: "2.0 MB",
      restorable: true,
    });
  }
  setAppliedPackId(pack.id);

  return { status: "success", appliedCount: pack.assignments.length };
}

export function runApplyPack(
  pack: SoundPack,
  onProgress: ProgressFn,
  options: { skipBackup?: boolean } = {},
): { promise: Promise<ApplyOutcome>; handle: ApplyPackHandle } {
  let cancelled = false;
  const handle: ApplyPackHandle = {
    cancel: () => {
      cancelled = true;
    },
  };
  const isCancelled = () => cancelled;

  const run = isRunningInTauri() ? runRealApply : runSimulatedApply;
  const promise = run(pack, onProgress, options, isCancelled).catch(
    (error: unknown): ApplyOutcome => {
      if (error instanceof CancelledError) {
        return { status: "recoverable-error", message: "error.applyCancelled" };
      }
      return {
        status: "unrecoverable-error",
        message: "error.registryWrite",
        detail: String(error),
      };
    },
  );

  return { promise, handle };
}
