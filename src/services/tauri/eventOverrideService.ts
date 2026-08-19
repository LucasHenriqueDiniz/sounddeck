import type { PackEventAssignment, WindowsEventId } from "../../types/soundEvent";
import { eventKey } from "../../types/soundEvent";

/**
 * Per-pack event overrides, persisted locally.
 *
 * The Editor used to be in-session only: you could swap a sound, apply, and
 * the moment you navigated away the edit was gone. Overrides are stored here
 * instead, keyed by pack id and then by event, so each pack keeps its own
 * edits and switching between packs doesn't blend them together.
 *
 * localStorage for the same reason customPackService uses it — nothing here
 * leaves the machine, so this needs no Tauri command and no filesystem
 * capability. Audio is never copied: a borrowed catalog sound is re-resolved
 * from its source pack at apply time, and a custom file keeps the absolute
 * path the native dialog returned.
 */
const STORAGE_KEY = "sounddeck.eventOverrides";

/** Only the parts of an assignment an override is allowed to change. */
export type EventOverride = Pick<
  PackEventAssignment,
  "state" | "fileName" | "filePath" | "sourcePackId" | "sourcePackName" | "durationMs"
>;

type OverrideStore = Record<string, Record<string, EventOverride>>;

function readAll(): OverrideStore {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed: unknown = JSON.parse(raw);
    // A hand-edited or half-written value should cost the user their
    // overrides, not the whole screen.
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? (parsed as OverrideStore) : {};
  } catch {
    return {};
  }
}

function writeAll(store: OverrideStore): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch {
    // Quota or a locked-down profile. The edit still applies in-session;
    // losing persistence is not worth breaking the editor over.
  }
}

export function listOverrides(packId: string): Record<string, EventOverride> {
  return readAll()[packId] ?? {};
}

export function saveOverride(packId: string, id: WindowsEventId, override: EventOverride): void {
  const store = readAll();
  const forPack = { ...(store[packId] ?? {}) };
  forPack[eventKey(id)] = override;
  store[packId] = forPack;
  writeAll(store);
}

/** Drops an override so the event falls back to whatever the pack itself says. */
export function clearOverride(packId: string, id: WindowsEventId): void {
  const store = readAll();
  const forPack = store[packId];
  if (!forPack) return;
  delete forPack[eventKey(id)];
  if (Object.keys(forPack).length === 0) delete store[packId];
  else store[packId] = forPack;
  writeAll(store);
}

export function clearAllOverrides(packId: string): void {
  const store = readAll();
  if (!(packId in store)) return;
  delete store[packId];
  writeAll(store);
}

/**
 * Layers stored overrides over a pack's own assignments. Events with no
 * override are returned untouched, so a pack that later gains a sound for an
 * event the user never edited picks it up on its own.
 */
export function applyOverrides(
  assignments: PackEventAssignment[],
  overrides: Record<string, EventOverride>,
): PackEventAssignment[] {
  if (Object.keys(overrides).length === 0) return assignments;
  return assignments.map((assignment) => {
    const override = overrides[eventKey(assignment.eventId)];
    if (!override) return assignment;
    return {
      eventId: assignment.eventId,
      state: override.state,
      fileName: override.fileName,
      filePath: override.filePath,
      sourcePackId: override.sourcePackId,
      sourcePackName: override.sourcePackName,
      durationMs: override.durationMs,
    };
  });
}
