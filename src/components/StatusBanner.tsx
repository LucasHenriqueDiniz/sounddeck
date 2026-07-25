import type { ReactNode } from "react";
import { AlertCircleIcon, AlertTriangleIcon, CheckIcon, InfoIcon } from "./icons/icons";
import styles from "./StatusBanner.module.css";

type Severity = "info" | "success" | "warning" | "danger";

interface StatusBannerProps {
  severity: Severity;
  title: string;
  description?: string;
  action?: ReactNode;
  onDismiss?: () => void;
}

const ICONS: Record<Severity, ReactNode> = {
  info: <InfoIcon />,
  success: <CheckIcon />,
  warning: <AlertTriangleIcon />,
  danger: <AlertCircleIcon />,
};

/** Persistent/contextual banner for system-level status. */
export function StatusBanner({ severity, title, description, action, onDismiss }: StatusBannerProps) {
  return (
    <div
      className={[styles.banner, styles[severity]].join(" ")}
      role={severity === "danger" ? "alert" : "status"}
      aria-live={severity === "danger" ? "assertive" : "polite"}
    >
      <span className={styles.icon}>{ICONS[severity]}</span>
      <div className={styles.body}>
        <p className={styles.title}>{title}</p>
        {description && <p className={styles.description}>{description}</p>}
      </div>
      {action && <div className={styles.action}>{action}</div>}
      {onDismiss && (
        <button className={styles.dismiss} onClick={onDismiss} aria-label="Dispensar aviso">
          ×
        </button>
      )}
    </div>
  );
}
