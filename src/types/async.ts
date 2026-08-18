import type { TranslationKey } from "../i18n";

export type AsyncState<T> =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: T }
  | { status: "error"; message: string };

export interface NativeCapabilityStatus {
  available: boolean;
  eventCount?: number;
  messageKey: TranslationKey;
  /** Raw, untranslated diagnostic text (e.g. a caught OS error) — shown appended to the message, never on its own. */
  detail?: string;
}
