import { useMemo, useState } from "react";
import { AudioPreviewButton } from "../../components/AudioPreviewButton";
import { Button } from "../../components/Button";
import { Dialog } from "../../components/Dialog";
import { AlertCircleIcon, DisableIcon, ReplaceIcon, UndoIcon } from "../../components/icons/icons";
import { formatDuration } from "../../lib/format";
import type { SoundPack } from "../../types/pack";
import type { EventFriendlyMeta, PackEventAssignment } from "../../types/soundEvent";
import { eventKey } from "../../types/soundEvent";
import type { PickWavResult } from "../../services/tauri/fileDialogService";
import { resolvePackFileUrl } from "../../services/tauri/remoteCatalogService";
import { useT, type TranslationKey } from "../../i18n";
import styles from "./SoundPickerDialog.module.css";

export interface LibrarySound {
  packId: string;
  packName: string;
  fileName: string;
  durationMs?: number;
  /** Undefined for packs with no remote audio — preview falls back to a tone. */
  audioUrl?: string;
}

interface SoundPickerDialogProps {
  open: boolean;
  meta: EventFriendlyMeta;
  assignment: PackEventAssignment;
  /** Every pack in the library, including the one being edited. */
  library: SoundPack[];
  /** The pack being edited — its own sound is marked rather than listed twice. */
  currentPackId?: string;
  onClose: () => void;
  onChooseLibrary: (sound: LibrarySound) => void;
  onChooseCustom: () => Promise<PickWavResult>;
  onUseDefault: () => void;
  onDisable: () => void;
}

/**
 * Picks the sound for one event.
 *
 * The list is built from every pack that actually provides this event, which
 * is the point: a pack missing a sound is normal — some schemes never had one
 * — and rather than leaving the row stuck on the Windows default, the user can
 * borrow from any other pack, or from a file of their own.
 */
export function SoundPickerDialog({
  open,
  meta,
  assignment,
  library,
  currentPackId,
  onClose,
  onChooseLibrary,
  onChooseCustom,
  onUseDefault,
  onDisable,
}: SoundPickerDialogProps) {
  const t = useT();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const key = eventKey(meta.id);

  const sounds = useMemo<LibrarySound[]>(() => {
    const found: LibrarySound[] = [];
    for (const pack of library) {
      const match = pack.assignments.find((a) => eventKey(a.eventId) === key && a.state === "pack");
      if (!match?.fileName) continue;
      found.push({
        packId: pack.id,
        packName: pack.name,
        fileName: match.fileName,
        durationMs: match.durationMs,
        audioUrl: pack.remoteBaseUrl
          ? resolvePackFileUrl(pack.remoteBaseUrl, pack.id, match.fileName)
          : undefined,
      });
    }
    // The pack being edited first, then alphabetically — the most likely pick
    // shouldn't be somewhere in the middle of thirty rows.
    return found.sort((a, b) => {
      if (a.packId === currentPackId) return -1;
      if (b.packId === currentPackId) return 1;
      return a.packName.localeCompare(b.packName);
    });
  }, [library, key, currentPackId]);

  const selectedFile = assignment.state === "pack" ? assignment.fileName : undefined;
  const selectedPackId = assignment.sourcePackId ?? (selectedFile ? currentPackId : undefined);

  async function handleCustom() {
    setBusy(true);
    const result = await onChooseCustom();
    setBusy(false);
    if (result.status === "invalid") setError(t(result.reason as TranslationKey));
    else if (result.status === "unavailable") setError(t("event.desktopOnly"));
    else if (result.status === "picked") {
      setError(null);
      onClose();
    }
  }

  const name = t(`soundEvent.${meta.id.event}.name` as TranslationKey);

  return (
    <Dialog
      open={open}
      title={t("picker.title", { event: name })}
      description={t("picker.desc")}
      onClose={onClose}
      size="lg"
      footer={
        <div className={styles.footer}>
          <div className={styles.footerLeft}>
            <Button
              variant="ghost"
              icon={<UndoIcon size={14} />}
              onClick={() => {
                onUseDefault();
                onClose();
              }}
              disabled={assignment.state === "default"}
            >
              {t("picker.resetDefault")}
            </Button>
            <Button
              variant="ghost"
              icon={<DisableIcon size={14} />}
              onClick={() => {
                onDisable();
                onClose();
              }}
              disabled={assignment.state === "disabled"}
            >
              {t("event.disable")}
            </Button>
          </div>
          <Button variant="secondary" onClick={onClose}>
            {t("common.close")}
          </Button>
        </div>
      }
    >
      <div className={styles.body}>
        <Button
          variant="secondary"
          icon={<ReplaceIcon size={14} />}
          onClick={handleCustom}
          disabled={busy}
          className={styles.customButton}
        >
          {t("picker.chooseFile")}
        </Button>

        {assignment.state === "pack" && assignment.filePath && (
          <p className={styles.currentCustom}>
            {t("picker.currentCustom", { file: assignment.fileName ?? "" })}
          </p>
        )}

        {error && (
          <p className={styles.error} role="alert">
            <AlertCircleIcon size={13} /> {error}
          </p>
        )}

        <p className={styles.sectionLabel}>{t("picker.fromLibrary", { count: sounds.length })}</p>

        {sounds.length === 0 ? (
          <p className={styles.empty}>{t("picker.noneInLibrary")}</p>
        ) : (
          <ul className={styles.list}>
            {sounds.map((sound) => {
              const isCurrent =
                sound.fileName === selectedFile && sound.packId === selectedPackId;
              return (
                <li key={`${sound.packId}:${sound.fileName}`}>
                  <div className={`${styles.item} ${isCurrent ? styles.itemCurrent : ""}`}>
                    <AudioPreviewButton
                      seed={`${sound.packId}:${sound.fileName}`}
                      label={sound.fileName}
                      size="sm"
                      audioUrl={sound.audioUrl}
                    />
                    <div className={styles.itemInfo}>
                      <span className={styles.itemFile} title={sound.fileName}>
                        {sound.fileName}
                      </span>
                      <span className={styles.itemSource}>
                        {sound.packName}
                        {sound.packId === currentPackId ? ` · ${t("picker.thisPack")}` : ""}
                      </span>
                    </div>
                    <span className={`${styles.itemDuration} tabular-nums`}>
                      {formatDuration(sound.durationMs)}
                    </span>
                    <Button
                      variant={isCurrent ? "ghost" : "secondary"}
                      onClick={() => {
                        onChooseLibrary(sound);
                        onClose();
                      }}
                      disabled={isCurrent}
                    >
                      {isCurrent ? t("picker.inUse") : t("picker.use")}
                    </Button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </Dialog>
  );
}
