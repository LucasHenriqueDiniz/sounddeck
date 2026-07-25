import type { KeyboardEvent, MouseEvent } from "react";
import { AudioPreviewButton } from "../../components/AudioPreviewButton";
import { Badge } from "../../components/Badge";
import { Button } from "../../components/Button";
import { CheckIcon } from "../../components/icons/icons";
import type { SoundPack } from "../../types/pack";
import { resolvePackFileUrl } from "../../services/tauri/remoteCatalogService";
import { derivePackTags } from "../../lib/packTags";
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

const ORIGIN_LABEL: Record<SoundPack["origin"], string> = {
  microsoft: "Microsoft",
  community: "Comunidade",
  sounddeck: "SoundDeck",
};

const ORIGIN_TAGS = new Set(["Oficial", "Comunidade", "SoundDeck"]);

export function PackCard({ pack, soundCount, isApplied, isSelected, onSelect, onApply }: PackCardProps) {
  const eraTags = derivePackTags(pack).filter((tag) => !ORIGIN_TAGS.has(tag));

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
      aria-label={`${pack.name}, ${soundCount} sons${isApplied ? ", aplicado atualmente" : ""}`}
      onClick={onSelect}
      onKeyDown={handleKeyDown}
    >
      <div className={styles.coverWrap}>
        <PackCoverArt cover={pack.cover} />
        {isApplied && (
          <span className={styles.appliedBadge}>
            <Badge variant="accent" icon={<CheckIcon size={12} />}>
              Aplicado
            </Badge>
          </span>
        )}
      </div>

      <div className={styles.body}>
        <p className={styles.name}>{pack.name}</p>
        <p className={styles.meta}>
          {ORIGIN_LABEL[pack.origin]} · {soundCount} sons
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
          label={`o pack ${pack.name}`}
          size="sm"
          audioUrl={representativePreviewUrl(pack)}
        />
        <Button size="sm" variant={isSelected ? "primary" : "secondary"} onClick={handleActionClick}>
          {isSelected ? "Aplicar" : "Selecionar"}
        </Button>
      </div>
    </div>
  );
}
