import type { PackCoverArt as PackCoverArtData } from "../../types/pack";
import styles from "./PackCoverArt.module.css";

interface PackCoverArtProps {
  cover: PackCoverArtData;
  size?: "card" | "details";
}

export function PackCoverArt({ cover, size = "card" }: PackCoverArtProps) {
  return (
    <div
      className={[styles.cover, styles[size]].join(" ")}
      style={{ background: `linear-gradient(155deg, ${cover.gradientFrom}, ${cover.gradientTo})` }}
      aria-hidden="true"
    >
      <span className={styles.glyph}>{cover.glyph}</span>
    </div>
  );
}
