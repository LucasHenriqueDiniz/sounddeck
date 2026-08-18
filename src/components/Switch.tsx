import styles from "./Switch.module.css";

interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  disabled?: boolean;
}

/** Accessible on/off toggle — a native checkbox styled as a track+thumb, so keyboard and screen-reader behavior come for free. */
export function Switch({ checked, onChange, label, disabled }: SwitchProps) {
  return (
    <label className={styles.switch} aria-disabled={disabled || undefined}>
      <input
        type="checkbox"
        role="switch"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
        aria-label={label}
        className={styles.input}
      />
      <span className={styles.track}>
        <span className={styles.thumb} />
      </span>
    </label>
  );
}
