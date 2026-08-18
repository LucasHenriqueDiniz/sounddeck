import type { KeyboardEvent, MouseEvent } from "react";
import { AudioPreviewButton } from "../../components/AudioPreviewButton";
import { Badge } from "../../components/Badge";
import { Button } from "../../components/Button";
import { CheckIcon } from "../../components/icons/icons";
import type { SoundPack } from "../../types/pack";
import { resolvePackFileUrl } from "../../services/tauri/remoteCatalogService";
import { derivePackTags, resolveTagLabel } from "../../lib/packTags";
import { useT } from "../../i18n";
import { PackCoverArt } from "./PackCoverArt";
import styles from "./PackCard.module.css";

/** First real file this pack provides, if any — used as the card's representative preview. */
function representativePreviewUrl(pack: SoundPack): string | undefined {
  if (!pack.remoteBaseUrl) return undefined;
  const first = pack.assignments.find((a) => a.state === "pack" && a.fileName);
  return first?.fileName ? resolvePackFileUrl(pack.remoteBaseUrl, pack.id, first.fileName) : undefined;
}

interface PackCardProps {
  pack: SoundPack;
  soundCount: number;
  isApplied: boolean;
  isSelected: boolean;
  onSelect: () => void;
  onApply: () => void;
}

export function PackCard({ pack, soundCount, isApplied, isSelected, onSelect, onApply }: PackCardProps) {
  const t = useT();
  const eraTags = derivePackTags(pack).filter((tag) => !tag.startsWith("pack.origin."));
  const originTag = derivePackTags(pack).find((tag) => tag.startsWith("pack.origin."));

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onSelect();
    }
  }

  function handleActionClick(event: MouseEvent) {
    event.stopPropagation();
    if (isSelected) onApply();
    else onSelect();
  }

  return (
    <div
      className={[styles.card, isSelected ? styles.selected : ""].join(" ")}
      role="button"
      tabIndex={0}
      aria-pressed={isSelected}
      aria-label={t(isApplied ? "pack.cardLabelApplied" : "pack.cardLabel", { name: pack.name, count: soundCount })}
      onClick={onSelect}
      onKeyDown={handleKeyDown}
    >
      <div className={styles.coverWrap}>
        <PackCoverArt cover={pack.cover} />
        {isApplied && (
          <span className={styles.appliedBadge}>
            <Badge variant="accent" icon={<CheckIcon size={12} />}>
              {t("pack.appliedNow")}
            </Badge>
          </span>
        )}
      </div>

      <div className={styles.body}>
        <p className={styles.name}>{pack.name}</p>
        <p className={styles.meta}>
          {originTag ? resolveTagLabel(t, originTag) : null} · {t("pack.sounds", { count: soundCount })}
        </p>
        {eraTags.length > 0 && (
          <div className={styles.tags}>
            {eraTags.map((tag) => (
              <span key={tag} className={styles.tag}>
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className={styles.actions}>
        <AudioPreviewButton
          seed={pack.id}
          label={pack.name}
          size="sm"
          audioUrl={representativePreviewUrl(pack)}
        />
        <Button size="sm" variant={isSelected ? "primary" : "secondary"} onClick={handleActionClick}>
          {isSelected ? t("pack.apply") : t("pack.select")}
        </Button>
      </div>
    </div>
  );
}
