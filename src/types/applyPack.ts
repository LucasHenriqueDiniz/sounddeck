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
  validating: "Validando pack e eventos",
  "creating-backup": "Criando backup do esquema atual",
  "processing-audio": "Processando sons",
  "copying-files": "Copiando arquivos",
  "writing-registry": "Alterando configurações do Windows",
  verifying: "Verificando aplicação",
  complete: "Concluído",
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
