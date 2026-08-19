import { SOUND_EVENT_CATALOG } from "../../mocks/soundEventCatalog";
import { EVENT_CATEGORY_KEY, EVENT_CATEGORY_ORDER, eventKey } from "../../types/soundEvent";
import type { PackEventAssignment } from "../../types/soundEvent";
import type { PickWavResult } from "../../services/tauri/fileDialogService";
import type { SoundPack } from "../../types/pack";
import type { LibrarySound } from "./SoundPickerDialog";
import { SoundEventRow } from "./SoundEventRow";
import { ChevronDownIcon } from "../../components/icons/icons";
import styles from "./SoundEventList.module.css";
import { useT, type TranslationKey } from "../../i18n";

interface SoundEventListProps {
  assignments: PackEventAssignment[];
  onUseDefault: (id: PackEventAssignment["eventId"]) => void;
  onDisable: (id: PackEventAssignment["eventId"]) => void;
  onReplace: (id: PackEventAssignment["eventId"]) => Promise<PickWavResult>;
  /** Both set together, and only where borrowing makes sense — the
   *  custom-pack builder has no pack to borrow into. */
  onUseLibrarySound?: (id: PackEventAssignment["eventId"], sound: LibrarySound) => void;
  library?: SoundPack[];
  /** Set together — lets rows stream the real file instead of a synthesized tone. */
  packId?: string;
  remoteBaseUrl?: string;
}

export function SoundEventList({
  assignments,
  onUseDefault,
  onDisable,
  onReplace,
  onUseLibrarySound,
  library,
  packId,
  remoteBaseUrl,
}: SoundEventListProps) {
  const t = useT();
  const byKey = new Map(assignments.map((a) => [eventKey(a.eventId), a]));

  return (
    <div className={styles.list}>
      {EVENT_CATEGORY_ORDER.map((category) => {
        const items = SOUND_EVENT_CATALOG.filter((meta) => meta.category === category);
        if (items.length === 0) return null;

        return (
          <details key={category} className={styles.group} open>
            <summary className={styles.summary}>
              <ChevronDownIcon size={14} className={styles.chevron} />
              <span className={styles.groupTitle}>{t(EVENT_CATEGORY_KEY[category] as TranslationKey)}</span>
              <span className={styles.groupCount}>{items.length}</span>
            </summary>
            <div className={styles.rows}>
              {items.map((meta) => {
                const assignment = byKey.get(eventKey(meta.id));
                if (!assignment) return null;
                return (
                  <SoundEventRow
                    key={eventKey(meta.id)}
                    meta={meta}
                    assignment={assignment}
                    onUseDefault={() => onUseDefault(meta.id)}
                    onDisable={() => onDisable(meta.id)}
                    onReplace={() => onReplace(meta.id)}
                    onUseLibrarySound={
                      onUseLibrarySound ? (sound) => onUseLibrarySound(meta.id, sound) : undefined
                    }
                    library={library}
                    packId={packId}
                    remoteBaseUrl={remoteBaseUrl}
                  />
                );
              })}
            </div>
          </details>
        );
      })}
    </div>
  );
}
