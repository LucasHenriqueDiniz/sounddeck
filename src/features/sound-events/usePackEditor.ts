import { useCallback, useEffect, useRef, useState } from "react";
import type { PackEventAssignment, WindowsEventId } from "../../types/soundEvent";
import { eventKey } from "../../types/soundEvent";
import type { SoundPack } from "../../types/pack";
import { pickReplacementWav, type PickWavResult } from "../../services/tauri/fileDialogService";
import {
  applyOverrides,
  clearAllOverrides,
  clearOverride,
  listOverrides,
  saveOverride,
  type EventOverride,
} from "../../services/tauri/eventOverrideService";

/**
 * Editor for a pack's event assignments.
 *
 * Edits used to live only in React state: swap a sound, navigate away, and it
 * was gone. They are now written to eventOverrideService, keyed by pack, so a
 * pack keeps its edits between sessions and two packs never share them.
 *
 * "Dirty" therefore no longer means "unsaved" — everything is saved
 * immediately. It means "differs from the pack as published", which is what
 * the Editor's banner and Discard button are actually about: the registry
 * still holds whatever was last applied.
 */
export function usePackEditor(pack: SoundPack | null) {
  const packId = pack?.id;
  const published = useRef<PackEventAssignment[]>(pack?.assignments ?? []);
  const [assignments, setAssignments] = useState<PackEventAssignment[]>(() =>
    pack ? applyOverrides(pack.assignments, listOverrides(pack.id)) : [],
  );

  useEffect(() => {
    published.current = pack?.assignments ?? [];
    setAssignments(pack ? applyOverrides(pack.assignments, listOverrides(pack.id)) : []);
  }, [packId, pack?.assignments]);

  const dirty = JSON.stringify(assignments) !== JSON.stringify(published.current);

  /**
   * Writes one event, in state and in storage together. Storing the whole
   * override rather than a patch keeps the two representations identical —
   * a partial write is what would let state and storage drift apart.
   */
  const set = useCallback(
    (id: WindowsEventId, override: EventOverride) => {
      setAssignments((prev) =>
        prev.map((a) =>
          eventKey(a.eventId) === eventKey(id) ? { eventId: a.eventId, ...override } : a,
        ),
      );
      if (!packId) return;
      const original = published.current.find((a) => eventKey(a.eventId) === eventKey(id));
      const matchesPublished =
        original &&
        original.state === override.state &&
        original.fileName === override.fileName &&
        !override.sourcePackId &&
        !override.filePath;
      // Storing an override identical to the pack's own value would pin the
      // event to today's catalog: a pack that later ships a real sound for it
      // would be shadowed forever.
      if (matchesPublished) clearOverride(packId, id);
      else saveOverride(packId, id, override);
    },
    [packId],
  );

  const useDefault = useCallback(
    (id: WindowsEventId) => set(id, { state: "default" }),
    [set],
  );

  const disable = useCallback((id: WindowsEventId) => set(id, { state: "disabled" }), [set]);

  /** Takes the sound from another pack in the library — or from this one. */
  const useLibrarySound = useCallback(
    (
      id: WindowsEventId,
      sound: { packId: string; packName: string; fileName: string; durationMs?: number },
    ) => {
      set(id, {
        state: "pack",
        fileName: sound.fileName,
        // Only tag a source when it is genuinely another pack; tagging the
        // pack's own id would make every untouched event look borrowed.
        sourcePackId: sound.packId === packId ? undefined : sound.packId,
        sourcePackName: sound.packId === packId ? undefined : sound.packName,
        durationMs: sound.durationMs,
      });
    },
    [set, packId],
  );

  const replaceFile = useCallback(
    async (id: WindowsEventId): Promise<PickWavResult> => {
      const result = await pickReplacementWav();
      if (result.status === "picked") {
        set(id, { state: "pack", fileName: result.fileName, filePath: result.path });
      }
      return result;
    },
    [set],
  );

  /** Drops every override, putting the pack back to how it is published. */
  const reset = useCallback(() => {
    if (packId) clearAllOverrides(packId);
    setAssignments(published.current);
  }, [packId]);

  return { assignments, dirty, useDefault, disable, useLibrarySound, replaceFile, reset };
}
