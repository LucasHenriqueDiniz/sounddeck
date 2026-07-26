import { useState } from "react";
import type { PackCoverArt as PackCoverArtData } from "../../types/pack";
import styles from "./PackCoverArt.module.css";

interface PackCoverArtProps {
  cover: PackCoverArtData;
  size?: "card" | "details";
}

export function PackCoverArt({ cover, size = "card" }: PackCoverArtProps) {
  const [imageFailed, setImageFailed] = useState(false);
  const showImage = Boolean(cover.imageUrl) && !imageFailed;

  return (
    <div
      className={[styles.cover, styles[size]].join(" ")}
      style={showImage ? undefined : { background: `linear-gradient(155deg, ${cover.gradientFrom}, ${cover.gradientTo})` }}
      aria-hidden="true"
    >
      {showImage ? (
        <img
          src={cover.imageUrl}
          alt=""
          className={styles.image}
          onError={() => setImageFailed(true)}
        />
      ) : (
        <span className={styles.glyph}>{cover.glyph}</span>
      )}
    </div>
  );
}
