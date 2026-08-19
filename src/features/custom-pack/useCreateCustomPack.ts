import { useState } from "react";
import { SOUND_EVENT_CATALOG } from "../../mocks/soundEventCatalog";
import type { PackEventAssignment, WindowsEventId } from "../../types/soundEvent";
import { eventKey } from "../../types/soundEvent";
import { pickReplacementWav, type PickWavResult } from "../../services/tauri/fileDialogService";

function emptyAssignments(): PackEventAssignment[] {
  return SOUND_EVENT_CATALOG.map((meta) => ({ eventId: meta.id, state: "default" as const }));
}

/**
 * Session-local state for the custom pack creation screen — mirrors
 * usePackEditor.ts (same replace/default/disable shape, so it can reuse
 * SoundEventList/SoundEventRow), but starts empty instead of from an
 * existing pack and has no "dirty" concept since there is no saved baseline
 * yet.
 */
export function useCreateCustomPack() {
  const [name, setName] = useState("");
  const [assignments, setAssignments] = useState<PackEventAssignment[]>(emptyAssignments);

  function update(id: WindowsEventId, patch: Partial<PackEventAssignment>) {
    setAssignments((prev) =>
      prev.map((a) => (eventKey(a.eventId) === eventKey(id) ? { ...a, ...patch } : a)),
    );
  }

  function useDefault(id: WindowsEventId) {
    update(id, { state: "default", fileName: undefined, filePath: undefined, durationMs: undefined });
  }

  function disable(id: WindowsEventId) {
    update(id, { state: "disabled", fileName: undefined, filePath: undefined, durationMs: undefined });
  }

  async function replaceFile(id: WindowsEventId): Promise<PickWavResult> {
    const result = await pickReplacementWav();
    if (result.status === "picked") {
      update(id, {
        state: "pack",
        fileName: result.fileName,
        filePath: result.path,
        durationMs: undefined,
      });
    }
    return result;
  }

  function reset() {
    setName("");
    setAssignments(emptyAssignments());
  }

  const soundCount = assignments.filter((a) => a.state === "pack").length;

  return { name, setName, assignments, useDefault, disable, replaceFile, reset, soundCount };
}
