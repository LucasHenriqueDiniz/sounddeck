import { APPLY_PHASE_KEY, APPLY_PHASE_ORDER } from "../../types/applyPack";
import type { ApplyPhase } from "../../types/applyPack";
import { ProgressBar } from "../../components/ProgressBar";
import { CheckIcon } from "../../components/icons/icons";
import styles from "./ApplyProgress.module.css";
import { useT, type TranslationKey } from "../../i18n";

interface ApplyProgressProps {
  currentPhase: ApplyPhase;
  currentPhaseProgress: number;
}

export function ApplyProgress({ currentPhase, currentPhaseProgress }: ApplyProgressProps) {
  const t = useT();
  const currentIndex = APPLY_PHASE_ORDER.indexOf(currentPhase);

  return (
    <div className={styles.wrapper} aria-live="polite">
      <ol className={styles.steps}>
        {APPLY_PHASE_ORDER.filter((p) => p !== "complete").map((phase, index) => {
          const done = index < currentIndex;
          const active = index === currentIndex;
          return (
            <li
              key={phase}
              className={[styles.step, done ? styles.done : "", active ? styles.active : ""].join(" ")}
            >
              <span className={styles.marker}>{done ? <CheckIcon size={12} /> : index + 1}</span>
              <span className={styles.label}>{t(APPLY_PHASE_KEY[phase] as TranslationKey)}</span>
            </li>
          );
        })}
      </ol>

      <div className={styles.progress}>
        <ProgressBar
          value={currentPhase === "complete" ? 1 : currentPhaseProgress}
          label={t("apply.currentPhase", { phase: t(APPLY_PHASE_KEY[currentPhase] as TranslationKey) })}
        />
        <p className={styles.progressLabel}>{t(APPLY_PHASE_KEY[currentPhase] as TranslationKey)}…</p>
      </div>
    </div>
  );
}
