export type ApplyPhase =
  | "validating"
  | "creating-backup"
  | "processing-audio"
  | "copying-files"
  | "writing-registry"
  | "verifying"
  | "complete";

export const APPLY_PHASE_ORDER: ApplyPhase[] = [
  "validating",
  "creating-backup",
  "processing-audio",
  "copying-files",
  "writing-registry",
  "verifying",
  "complete",
];

/** Translation keys — resolve with useT() at render time. */
export const APPLY_PHASE_KEY: Record<ApplyPhase, string> = {
  validating: "apply.phase.validating",
  "creating-backup": "apply.phase.creatingBackup",
  "processing-audio": "apply.phase.processingAudio",
  "copying-files": "apply.phase.copyingFiles",
  "writing-registry": "apply.phase.writingRegistry",
  verifying: "apply.phase.verifying",
  complete: "apply.phase.complete",
};

export interface ApplySummary {
  packName: string;
  totalEvents: number;
  usingPackSound: number;
  usingWindowsDefault: number;
  disabled: number;
  willCreateBackup: true;
}

export interface ApplyProgressState {
  phase: ApplyPhase;
  /** 0-1 progress within the current phase. */
  phaseProgress: number;
}

export type ApplyOutcome =
  | { status: "success"; appliedCount: number }
  | { status: "recoverable-error"; message: string; detail?: string }
  | { status: "unrecoverable-error"; message: string; detail?: string };
