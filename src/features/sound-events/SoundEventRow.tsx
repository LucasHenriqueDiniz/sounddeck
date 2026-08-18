import { useState } from "react";
import { AudioPreviewButton } from "../../components/AudioPreviewButton";
import { IconButton } from "../../components/IconButton";
import { AlertCircleIcon, DisableIcon, ReplaceIcon, UndoIcon } from "../../components/icons/icons";
import { formatDuration } from "../../lib/format";
import type { EventFriendlyMeta, PackEventAssignment } from "../../types/soundEvent";
import type { PickWavResult } from "../../services/tauri/fileDialogService";
import { resolvePackFileUrl } from "../../services/tauri/remoteCatalogService";
import { useT, type TranslationKey } from "../../i18n";
import { EventStateBadge } from "./EventStateBadge";
import styles from "./SoundEventRow.module.css";

interface SoundEventRowProps {
  meta: EventFriendlyMeta;
  assignment: PackEventAssignment;
  onUseDefault: () => void;
  onDisable: () => void;
  onReplace: () => Promise<PickWavResult>;
  packId?: string;
  remoteBaseUrl?: string;
}

export function SoundEventRow({
  meta,
  assignment,
  onUseDefault,
  onDisable,
  onReplace,
  packId,
  remoteBaseUrl,
}: SoundEventRowProps) {
  const t = useT();
  // `meta.friendlyName`/`meta.description` come from the English demo catalog
  // (src/mocks/soundEventCatalog.ts) and are used only as keys here — the
  // displayed text always comes from the soundEvent.<id>.* dictionary entries.
  const nameKey = `soundEvent.${meta.id.event}.name` as TranslationKey;
  const descKey = meta.description ? (`soundEvent.${meta.id.event}.desc` as TranslationKey) : undefined;

  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleReplace() {
    setBusy(true);
    const result = await onReplace();
    setBusy(false);
    // `reason`/the "unavailable" case are translation keys, not display text.
    if (result.status === "invalid") setError(t(result.reason as TranslationKey));
    else if (result.status === "unavailable") setError(t("event.desktopOnly"));
    else if (result.status === "picked") setError(null);
  }

  // Only valid for the pack's original remote file — if the user replaced it
  // via the native dialog, `fileName` now names a local file with no R2 key,
  // and this URL 404s. That's an honest failure (the preview button shows
  // its "couldn't load" state), not a false success.
  const audioUrl =
    remoteBaseUrl && packId && assignment.state === "pack" && assignment.fileName
      ? resolvePackFileUrl(remoteBaseUrl, packId, assignment.fileName)
      : undefined;

  const stateClass =
    assignment.state === "pack"
      ? styles.statePack
      : assignment.state === "default"
        ? styles.stateDefault
        : styles.stateDisabled;

  const name = t(nameKey);

  return (
    <div className={`${styles.row} ${stateClass}`}>
      <div className={styles.info}>
        <p className={styles.name}>{name}</p>
        {descKey && <p className={styles.description}>{t(descKey)}</p>}
      </div>

      <div className={styles.state}>
        <EventStateBadge state={assignment.state} />
        {assignment.fileName ? (
          <span className={styles.fileName} title={assignment.fileName}>
            {assignment.fileName}
          </span>
        ) : (
          <span className={styles.fileNameMuted}>{t("event.noFile")}</span>
        )}
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
        <IconButton label={t("event.replaceFile")} icon={<ReplaceIcon />} size="sm" onClick={handleReplace} disabled={busy} />
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
    </div>
  );
}
