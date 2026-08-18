import { Badge } from "../../components/Badge";
import { Button } from "../../components/Button";
import { CheckIcon, EditorIcon } from "../../components/icons/icons";
import type { SoundPack } from "../../types/pack";
import { buildApplySummary } from "../../services/tauri/applyPackService";
import { derivePackTags, resolveTagLabel, ORIGIN_TAG_KEY } from "../../lib/packTags";
import { useT } from "../../i18n";
import { PackCoverArt } from "./PackCoverArt";
import { PackSoundList } from "./PackSoundList";
import styles from "./PackDetails.module.css";

/**
 * Literal (untranslated) vendor names, as they appear in pack.author data —
 * used only to detect when the author IS the vendor, so we don't render
 * "Microsoft · Microsoft". The displayed origin tag is always translated.
 */
const ORIGIN_CANONICAL_AUTHOR: Partial<Record<SoundPack["origin"], string>> = {
  microsoft: "Microsoft",
  sounddeck: "SoundDeck",
};

interface PackDetailsProps {
  pack: SoundPack;
  isApplied: boolean;
  onApply: () => void;
  onEditEvents: () => void;
}

export function PackDetails({ pack, isApplied, onApply, onEditEvents }: PackDetailsProps) {
  const t = useT();
  const summary = buildApplySummary(pack);
  const originLabel = t(ORIGIN_TAG_KEY[pack.origin]);
  const authorIsOrigin = pack.author === ORIGIN_CANONICAL_AUTHOR[pack.origin];

  return (
    <div className={styles.panel}>
      <div className={styles.cover}>
        <PackCoverArt cover={pack.cover} size="details" />
      </div>

      <div className={styles.header}>
        <div className={styles.titleRow}>
          <h2 className={styles.title}>{pack.name}</h2>
          {isApplied && (
            <Badge variant="accent" icon={<CheckIcon size={12} />}>
              {t("pack.appliedNow")}
            </Badge>
          )}
        </div>
        <p className={styles.meta}>
          {authorIsOrigin ? pack.author : `${originLabel} · ${pack.author}`}
          {pack.releaseYear ? ` · ${pack.releaseYear}` : ""}
        </p>
        <p className={styles.description}>{pack.description}</p>
        {pack.sourceCredit && <p className={styles.credit}>{pack.sourceCredit}</p>}
        <div className={styles.tags}>
          {derivePackTags(pack).map((tag) => (
            <span key={tag} className={styles.tag}>
              {resolveTagLabel(t, tag)}
            </span>
          ))}
        </div>
      </div>

      <div className={styles.stats}>
        <div className={styles.stat}>
          <span className={`${styles.statValue} tabular-nums`}>{summary.totalEvents}</span>
          <span className={styles.statLabel}>{t("pack.events")}</span>
        </div>
        <div className={styles.stat}>
          <span className={`${styles.statValue} tabular-nums`}>{summary.usingPackSound}</span>
          <span className={styles.statLabel}>{t("pack.packSounds")}</span>
        </div>
        <div className={styles.stat}>
          <span className={`${styles.statValue} tabular-nums`}>{summary.disabled}</span>
          <span className={styles.statLabel}>{t("pack.disabled")}</span>
        </div>
      </div>

      <div className={styles.soundsSection}>
        <PackSoundList packId={pack.id} assignments={pack.assignments} remoteBaseUrl={pack.remoteBaseUrl} />
      </div>

      <div className={styles.actions}>
        <Button variant="secondary" icon={<EditorIcon />} onClick={onEditEvents}>
          {t("editor.editEvents")}
        </Button>
        <Button variant="primary" onClick={onApply} disabled={isApplied}>
          {isApplied ? t("pack.alreadyApplied") : t("pack.applyPack")}
        </Button>
      </div>
    </div>
  );
}
