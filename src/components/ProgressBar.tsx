import styles from "./ProgressBar.module.css";

interface ProgressBarProps {
  /** 0-1. Omit for an indeterminate bar. */
  value?: number;
  label?: string;
}

export function ProgressBar({ value, label }: ProgressBarProps) {
  const pct = value !== undefined ? Math.round(value * 100) : undefined;
  return (
    <div
      className={styles.track}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={pct}
      aria-label={label}
    >
      <div
        className={pct === undefined ? `${styles.fill} ${styles.indeterminate}` : styles.fill}
        style={pct === undefined ? undefined : { width: `${pct}%` }}
      />
    </div>
  );
}
