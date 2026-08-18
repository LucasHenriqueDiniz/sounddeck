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

export const APPLY_PHASE_LABEL: Record<ApplyPhase, string> = {
  validating: "Validating pack and events",
  "creating-backup": "Backing up the current scheme",
  "processing-audio": "Processing sounds",
  "copying-files": "Copying files",
  "writing-registry": "Writing Windows settings",
  verifying: "Verifying",
  complete: "Done",
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
  | { status: "success" }
  | { status: "recoverable-error"; message: string; detail?: string }
  | { status: "unrecoverable-error"; message: string; detail?: string };
