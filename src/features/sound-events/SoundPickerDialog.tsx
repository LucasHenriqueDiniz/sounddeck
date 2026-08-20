import { useMemo, useState } from "react";
import { AudioPreviewButton } from "../../components/AudioPreviewButton";
import { Button } from "../../components/Button";
import { Dialog } from "../../components/Dialog";
import {
  AlertCircleIcon,
  DisableIcon,
  ReplaceIcon,
  SearchIcon,
  UndoIcon,
} from "../../components/icons/icons";
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
  /** The pack being edited — its own sound is listed first and marked. */
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
 *
 * One scroller only. The list used to carry its own max-height and overflow
 * while sitting inside Dialog's already-scrollable body, so the wheel was
 * captured by the inner box and the dialog lurched once it bottomed out.
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
  const [query, setQuery] = useState("");

  const key = eventKey(meta.id);

  /** One group per pack that has a sound for this event. */
  const groups = useMemo(() => {
    const found: { packId: string; packName: string; sounds: LibrarySound[] }[] = [];
    for (const pack of library) {
      const matches = pack.assignments.filter(
        (a) => eventKey(a.eventId) === key && a.state === "pack" && a.fileName,
      );
      if (matches.length === 0) continue;
      found.push({
        packId: pack.id,
        packName: pack.name,
        sounds: matches.map((match) => ({
          packId: pack.id,
          packName: pack.name,
          fileName: match.fileName as string,
          durationMs: match.durationMs,
          audioUrl: pack.remoteBaseUrl
            ? resolvePackFileUrl(pack.remoteBaseUrl, pack.id, match.fileName as string)
            : undefined,
        })),
      });
    }
    // The pack being edited first — the most likely pick shouldn't be buried
    // somewhere in the middle of thirty groups.
    return found.sort((a, b) => {
      if (a.packId === currentPackId) return -1;
      if (b.packId === currentPackId) return 1;
      return a.packName.localeCompare(b.packName);
    });
  }, [library, key, currentPackId]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return groups;
    // Matching the pack name keeps a whole group when you search for it,
    // which is how people look for "the Vista one" rather than a filename.
    return groups
      .map((group) =>
        group.packName.toLowerCase().includes(needle)
          ? group
          : { ...group, sounds: group.sounds.filter((s) => s.fileName.toLowerCase().includes(needle)) },
      )
      .filter((group) => group.sounds.length > 0);
  }, [groups, query]);

  const total = groups.reduce((sum, g) => sum + g.sounds.length, 0);
  const shown = filtered.reduce((sum, g) => sum + g.sounds.length, 0);

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
        {/* Sticky so the search and the custom-file button stay reachable
            however far down the list you are. */}
        <div className={styles.toolbar}>
          <div className={styles.search}>
            <SearchIcon size={14} className={styles.searchIcon} />
            <input
              type="search"
              className={styles.searchInput}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={t("picker.search")}
              aria-label={t("picker.search")}
            />
          </div>
          <Button variant="secondary" icon={<ReplaceIcon size={14} />} onClick={handleCustom} disabled={busy}>
            {t("picker.chooseFile")}
          </Button>
        </div>

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

        <p className={styles.sectionLabel} aria-live="polite">
          {query.trim()
            ? t("picker.showing", { shown, total })
            : t("picker.fromLibrary", { count: total })}
        </p>

        {total === 0 ? (
          <p className={styles.empty}>{t("picker.noneInLibrary")}</p>
        ) : filtered.length === 0 ? (
          <p className={styles.empty}>{t("picker.noMatches", { query: query.trim() })}</p>
        ) : (
          filtered.map((group) => (
            <section key={group.packId} className={styles.group}>
              <h3 className={styles.groupTitle}>
                {group.packName}
                {group.packId === currentPackId && (
                  <span className={styles.groupTag}>{t("picker.thisPack")}</span>
                )}
              </h3>
              <ul className={styles.list}>
                {group.sounds.map((sound) => {
                  const isCurrent = sound.fileName === selectedFile && sound.packId === selectedPackId;
                  return (
                    <li key={`${sound.packId}:${sound.fileName}`}>
                      <div className={`${styles.item} ${isCurrent ? styles.itemCurrent : ""}`}>
                        <AudioPreviewButton
                          seed={`${sound.packId}:${sound.fileName}`}
                          label={sound.fileName}
                          size="sm"
                          audioUrl={sound.audioUrl}
                        />
                        <span className={styles.itemFile} title={sound.fileName}>
                          {sound.fileName}
                        </span>
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
            </section>
          ))
        )}
      </div>
    </Dialog>
  );
}
