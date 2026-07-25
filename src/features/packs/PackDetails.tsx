import { Badge } from "../../components/Badge";
import { Button } from "../../components/Button";
import { CheckIcon, EditorIcon } from "../../components/icons/icons";
import type { SoundPack } from "../../types/pack";
import { buildApplySummary } from "../../services/tauri/applyPackService";
import { PackCoverArt } from "./PackCoverArt";
import styles from "./PackDetails.module.css";

const ORIGIN_LABEL: Record<SoundPack["origin"], string> = {
  microsoft: "Microsoft",
  community: "Comunidade",
  sounddeck: "SoundDeck",
};

interface PackDetailsProps {
  pack: SoundPack;
  isApplied: boolean;
  onApply: () => void;
  onEditEvents: () => void;
}

export function PackDetails({ pack, isApplied, onApply, onEditEvents }: PackDetailsProps) {
  const summary = buildApplySummary(pack);

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
              Aplicado atualmente
            </Badge>
          )}
        </div>
        <p className={styles.meta}>
          {pack.author === ORIGIN_LABEL[pack.origin] ? pack.author : `${ORIGIN_LABEL[pack.origin]} · ${pack.author}`}
          {pack.releaseYear ? ` · ${pack.releaseYear}` : ""}
        </p>
        <p className={styles.description}>{pack.description}</p>
        {pack.sourceCredit && <p className={styles.credit}>{pack.sourceCredit}</p>}
      </div>

      <div className={styles.stats}>
        <div className={styles.stat}>
          <span className={`${styles.statValue} tabular-nums`}>{summary.totalEvents}</span>
          <span className={styles.statLabel}>eventos</span>
        </div>
        <div className={styles.stat}>
          <span className={`${styles.statValue} tabular-nums`}>{summary.usingPackSound}</span>
          <span className={styles.statLabel}>sons do pack</span>
        </div>
        <div className={styles.stat}>
          <span className={`${styles.statValue} tabular-nums`}>{summary.disabled}</span>
          <span className={styles.statLabel}>desativados</span>
        </div>
      </div>

      <div className={styles.actions}>
        <Button variant="secondary" icon={<EditorIcon />} onClick={onEditEvents}>
          Editar eventos
        </Button>
        <Button variant="primary" onClick={onApply} disabled={isApplied}>
          {isApplied ? "Já aplicado" : "Aplicar pack"}
        </Button>
      </div>
    </div>
  );
}
