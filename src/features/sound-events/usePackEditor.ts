import { useEffect, useRef, useState } from "react";
import type { PackEventAssignment, WindowsEventId } from "../../types/soundEvent";
import { eventKey } from "../../types/soundEvent";
import type { SoundPack } from "../../types/pack";
import { pickReplacementWav, type PickWavResult } from "../../services/tauri/fileDialogService";

/**
 * Local, in-session editor for a pack's event assignments. Edits are not
 * persisted anywhere — there is no "save pack" native command yet — but the
 * result feeds the (simulated) apply flow so the review-before-apply summary
 * reflects real edits made in this screen.
 */
export function usePackEditor(pack: SoundPack | null) {
  const [assignments, setAssignments] = useState<PackEventAssignment[]>(pack?.assignments ?? []);
  const original = useRef<PackEventAssignment[]>(pack?.assignments ?? []);

  useEffect(() => {
    setAssignments(pack?.assignments ?? []);
    original.current = pack?.assignments ?? [];
  }, [pack?.id]);

  const dirty = JSON.stringify(assignments) !== JSON.stringify(original.current);

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
    setAssignments(original.current);
  }

  return { assignments, dirty, useDefault, disable, replaceFile, reset };
}
