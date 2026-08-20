import { useState } from "react";
import { AudioPreviewButton } from "../../components/AudioPreviewButton";
import { IconButton } from "../../components/IconButton";
import { AlertCircleIcon, ChevronDownIcon, DisableIcon, UndoIcon } from "../../components/icons/icons";
import { formatDuration } from "../../lib/format";
import type { SoundPack } from "../../types/pack";
import type { EventFriendlyMeta, PackEventAssignment } from "../../types/soundEvent";
import type { PickWavResult } from "../../services/tauri/fileDialogService";
import { resolvePackFileUrl } from "../../services/tauri/remoteCatalogService";
import { useT, type TranslationKey } from "../../i18n";
import { EventStateBadge } from "./EventStateBadge";
import { SoundPickerDialog, type LibrarySound } from "./SoundPickerDialog";
import styles from "./SoundEventRow.module.css";

interface SoundEventRowProps {
  meta: EventFriendlyMeta;
  assignment: PackEventAssignment;
  onUseDefault: () => void;
  onDisable: () => void;
  onReplace: () => Promise<PickWavResult>;
  /** Absent in the custom-pack builder, which has no library to borrow from. */
  onUseLibrarySound?: (sound: LibrarySound) => void;
  library?: SoundPack[];
  packId?: string;
  remoteBaseUrl?: string;
}

export function SoundEventRow({
  meta,
  assignment,
  onUseDefault,
  onDisable,
  onReplace,
  onUseLibrarySound,
  library,
  packId,
  remoteBaseUrl,
}: SoundEventRowProps) {
  const t = useT();
  // `meta.friendlyName`/`meta.description` come from the English demo catalog
  // (src/mocks/soundEventCatalog.ts) and are used only as keys here — the
  // displayed text always comes from the soundEvent.<id>.* dictionary entries.
  const nameKey = `soundEvent.${meta.id.event}.name` as TranslationKey;
  const descKey = meta.description ? (`soundEvent.${meta.id.event}.desc` as TranslationKey) : undefined;

  const [pickerOpen, setPickerOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const canPick = Boolean(onUseLibrarySound && library);

  // Only used when there is no picker (the custom-pack builder). Inside the
  // picker the same failures are reported in the dialog instead.
  async function handleReplaceDirect() {
    setBusy(true);
    const result = await onReplace();
    setBusy(false);
    if (result.status === "invalid") setError(t(result.reason as TranslationKey));
    else if (result.status === "unavailable") setError(t("event.desktopOnly"));
    else if (result.status === "picked") setError(null);
  }

  /**
   * A borrowed sound resolves against the pack it came from, not the one being
   * edited — the file only exists under its own pack's prefix in the bucket.
   * A file the user picked from disk has no remote URL at all, so the preview
   * button falls back to its synthesized tone rather than 404ing.
   */
  const sourcePackId = assignment.sourcePackId ?? packId;
  const audioUrl =
    remoteBaseUrl && sourcePackId && assignment.state === "pack" && assignment.fileName && !assignment.filePath
      ? resolvePackFileUrl(remoteBaseUrl, sourcePackId, assignment.fileName)
      : undefined;

  const stateClass =
    assignment.state === "pack"
      ? styles.statePack
      : assignment.state === "default"
        ? styles.stateDefault
        : styles.stateDisabled;

  const name = t(nameKey);

  // Where this sound came from, shown under the file name so a borrowed or
  // custom sound is never mistaken for one the pack itself ships.
  const origin = assignment.sourcePackName
    ? t("event.fromPack", { pack: assignment.sourcePackName })
    : assignment.filePath
      ? t("event.fromFile")
      : undefined;

  return (
    <div className={`${styles.row} ${stateClass}`}>
      <div className={styles.info}>
        <p className={styles.name}>{name}</p>
        {descKey && <p className={styles.description}>{t(descKey)}</p>}
      </div>

      <div className={styles.state}>
        <EventStateBadge state={assignment.state} />
        {/*
          The sound is the control, not a label next to one. It was a passive
          span with the picker hidden behind an icon button that looked exactly
          like the three beside it — there was nothing on screen saying a sound
          could be chosen here.
        */}
        <button
          type="button"
          className={styles.soundSelect}
          onClick={canPick ? () => setPickerOpen(true) : handleReplaceDirect}
          disabled={busy}
          aria-label={t("event.chooseSoundFor", { event: name })}
        >
          <span className={styles.soundValue}>
            {assignment.fileName ? (
              <span className={styles.fileName} title={assignment.fileName}>
                {assignment.fileName}
              </span>
            ) : (
              <span className={styles.fileNameMuted}>{t("event.pickSound")}</span>
            )}
            {origin && <span className={styles.origin}>{origin}</span>}
          </span>
          <ChevronDownIcon size={14} className={styles.soundChevron} />
        </button>
        <span className={`${styles.duration} tabular-nums`}>{formatDuration(assignment.durationMs)}</span>
      </div>

      <div className={styles.controls}>
        <AudioPreviewButton
          seed={`${meta.id.app}\\${meta.id.event}:${assignment.fileName ?? assignment.state}`}
          label={name}
          size="sm"
          disabled={assignment.state === "disabled"}
          audioUrl={audioUrl}
        />
        <IconButton
          label={t("event.useDefault")}
          icon={<UndoIcon />}
          size="sm"
          onClick={onUseDefault}
          disabled={assignment.state === "default"}
        />
        <IconButton
          label={t("event.disable")}
          icon={<DisableIcon />}
          size="sm"
          onClick={onDisable}
          disabled={assignment.state === "disabled"}
        />
      </div>

      {error && (
        <p className={styles.error} role="alert">
          <AlertCircleIcon size={13} /> {error}
        </p>
      )}

      {/*
        Mounted only while open. Rendering it alongside every row put ~30
        native <dialog> elements in the tree at once, each holding the full
        sound list — and Dialog hardcodes id="dialog-title", so they also
        collided on a duplicate id that aria-labelledby resolves to the
        first match.
      */}
      {canPick && pickerOpen && (
        <SoundPickerDialog
          open
          meta={meta}
          assignment={assignment}
          library={library ?? []}
          currentPackId={packId}
          onClose={() => setPickerOpen(false)}
          onChooseLibrary={(sound) => onUseLibrarySound?.(sound)}
          onChooseCustom={onReplace}
          onUseDefault={onUseDefault}
          onDisable={onDisable}
        />
      )}
    </div>
  );
}
