import { SOUND_EVENT_CATALOG } from "../../mocks/soundEventCatalog";
import { AudioPreviewButton } from "../../components/AudioPreviewButton";
import { EVENT_CATEGORY_LABEL, EVENT_CATEGORY_ORDER, eventKey } from "../../types/soundEvent";
import type { PackEventAssignment } from "../../types/soundEvent";
import { resolvePackFileUrl } from "../../services/tauri/remoteCatalogService";
import styles from "./PackSoundList.module.css";

interface PackSoundListProps {
  packId: string;
  assignments: PackEventAssignment[];
  remoteBaseUrl?: string;
}

/**
 * Quick-preview list for the Library's detail panel — just name + play, no
 * edit controls (those live in the Editor). Only lists events this pack
 * actually provides a sound for; "default"/"disabled" events are covered by
 * the summary stats above, not repeated here.
 */
export function PackSoundList({ packId, assignments, remoteBaseUrl }: PackSoundListProps) {
  const byKey = new Map(assignments.map((a) => [eventKey(a.eventId), a]));
  const metaByCategory = EVENT_CATEGORY_ORDER.map((category) => ({
    category,
    items: SOUND_EVENT_CATALOG.filter((meta) => meta.category === category).filter((meta) => {
      const a = byKey.get(eventKey(meta.id));
      return a?.state === "pack";
    }),
  })).filter((group) => group.items.length > 0);

  if (metaByCategory.length === 0) {
    return (
      <div className={styles.section}>
        <p className={styles.heading}>Sons do pack</p>
        <p className={styles.empty}>Este pack não substitui nenhum som — todos os eventos usam o padrão do Windows.</p>
      </div>
    );
  }

  return (
    <div className={styles.section}>
      <p className={styles.heading}>Sons do pack</p>
      <div className={styles.list}>
        {metaByCategory.map(({ category, items }) => (
          <div key={category} className={styles.group}>
            <p className={styles.groupLabel}>{EVENT_CATEGORY_LABEL[category]}</p>
            {items.map((meta) => {
              const assignment = byKey.get(eventKey(meta.id));
              const audioUrl =
                remoteBaseUrl && assignment?.fileName
                  ? resolvePackFileUrl(remoteBaseUrl, packId, assignment.fileName)
                  : undefined;
              return (
                <div key={eventKey(meta.id)} className={styles.row}>
                  <span className={styles.name}>{meta.friendlyName}</span>
                  <AudioPreviewButton
                    seed={`${meta.id.app}\\${meta.id.event}:${assignment?.fileName ?? ""}`}
                    label={meta.friendlyName}
                    size="sm"
                    audioUrl={audioUrl}
                  />
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
