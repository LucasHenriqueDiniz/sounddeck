/**
 * Identifies a Windows sound event the same way the registry does:
 * HKCU\AppEvents\Schemes\Apps\<app>\<event>. Kept only in the technical
 * model — never rendered directly in the UI (see EventFriendlyMeta).
 */
export interface WindowsEventId {
  app: string;
  event: string;
}

export type EventCategory =
  | "system"
  | "notifications"
  | "devices"
  | "power"
  | "explorer"
  | "session";

/** Translation keys — resolve with useT() at render time. */
export const EVENT_CATEGORY_KEY: Record<EventCategory, string> = {
  system: "eventCategory.system",
  notifications: "eventCategory.notifications",
  devices: "eventCategory.devices",
  power: "eventCategory.power",
  explorer: "eventCategory.explorer",
  session: "eventCategory.session",
};

export const EVENT_CATEGORY_ORDER: EventCategory[] = [
  "system",
  "notifications",
  "devices",
  "power",
  "explorer",
  "session",
];

/** Human-facing metadata for a technical Windows event id. */
export interface EventFriendlyMeta {
  id: WindowsEventId;
  friendlyName: string;
  description?: string;
  category: EventCategory;
}

/** How a given pack resolves a given Windows event. */
export type EventAssignmentState = "pack" | "default" | "disabled";

export interface PackEventAssignment {
  eventId: WindowsEventId;
  state: EventAssignmentState;
  /** Base name, for display — set when state is "pack". */
  fileName?: string;
  /**
   * Absolute path to the .wav on this machine. Only set for files the user
   * picked themselves (custom packs, editor replacements); catalog packs
   * resolve their path by downloading at apply time instead. Applying needs a
   * real path, so dropping this on save would make a custom pack unappliable.
   */
  filePath?: string;
  /**
   * Set when the sound was borrowed from a *different* pack in the library —
   * the Editor lets any event take its sound from any pack that has one.
   * Apply resolves the download against this id instead of the pack being
   * applied; without it the file would be looked up under the wrong pack and
   * 404. `sourcePackName` is carried alongside so the row can name the origin
   * without holding the whole catalog.
   */
  sourcePackId?: string;
  sourcePackName?: string;
  durationMs?: number;
}

export function eventKey(id: WindowsEventId): string {
  return `${id.app}\\${id.event}`;
}
