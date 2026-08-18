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

export const EVENT_CATEGORY_LABEL: Record<EventCategory, string> = {
  system: "System",
  notifications: "Notifications",
  devices: "Devices",
  power: "Power",
  explorer: "Explorer",
  session: "Session",
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
  /** File name only (never a full path) — set when state is "pack". */
  fileName?: string;
  durationMs?: number;
}

export function eventKey(id: WindowsEventId): string {
  return `${id.app}\\${id.event}`;
}
