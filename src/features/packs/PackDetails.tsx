import { useState } from "react";
import { Badge } from "../../components/Badge";
import { Button } from "../../components/Button";
import { Dialog } from "../../components/Dialog";
import { CheckIcon, EditorIcon, TrashIcon } from "../../components/icons/icons";
import { resolvePackCredit, resolvePackDescription, type SoundPack } from "../../types/pack";
import { buildApplySummary } from "../../services/tauri/applyPackService";
import { deleteCustomPack } from "../../services/tauri/customPackService";
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
  chimer: "Chimer",
};

interface PackDetailsProps {
  pack: SoundPack;
  isApplied: boolean;
  onApply: () => void;
  onEditEvents: () => void;
  onDeleted?: () => void;
}

export function PackDetails({ pack, isApplied, onApply, onEditEvents, onDeleted }: PackDetailsProps) {
  const t = useT();
  const summary = buildApplySummary(pack);
  const originLabel = t(ORIGIN_TAG_KEY[pack.origin]);
  const credit = resolvePackCredit(pack, t);
  const authorIsOrigin = pack.author === ORIGIN_CANONICAL_AUTHOR[pack.origin];
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  function confirmDelete() {
    deleteCustomPack(pack.id);
    setConfirmingDelete(false);
    onDeleted?.();
  }

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
        <p className={styles.description}>{resolvePackDescription(pack, t)}</p>
        {credit && <p className={styles.credit}>{credit}</p>}
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
        {pack.origin === "custom" && (
          <Button variant="ghost" icon={<TrashIcon />} onClick={() => setConfirmingDelete(true)}>
            {t("customPack.delete")}
          </Button>
        )}
        <Button variant="secondary" icon={<EditorIcon />} onClick={onEditEvents}>
          {t("editor.editEvents")}
        </Button>
        <Button variant="primary" onClick={onApply} disabled={isApplied}>
          {isApplied ? t("pack.alreadyApplied") : t("pack.applyPack")}
        </Button>
      </div>

      {pack.origin === "custom" && (
        <Dialog
          open={confirmingDelete}
          onClose={() => setConfirmingDelete(false)}
          title={t("customPack.deleteConfirm.title")}
          description={t("customPack.deleteConfirm.desc", { name: pack.name })}
          footer={
            <>
              <Button variant="ghost" onClick={() => setConfirmingDelete(false)}>
                {t("common.cancel")}
              </Button>
              <Button variant="danger" onClick={confirmDelete}>
                {t("customPack.delete")}
              </Button>
            </>
          }
        >
          {null}
        </Dialog>
      )}
    </div>
  );
}
