import type { ReactNode } from "react";
import styles from "./Badge.module.css";

type BadgeVariant = "neutral" | "accent" | "success" | "warning" | "danger" | "info";

interface BadgeProps {
  variant?: BadgeVariant;
  icon?: ReactNode;
  children: ReactNode;
}

/** Status indicator. Always pairs an icon with text — never color alone. */
export function Badge({ variant = "neutral", icon, children }: BadgeProps) {
  return (
    <span className={[styles.badge, styles[variant]].join(" ")}>
      {icon}
      <span>{children}</span>
    </span>
  );
}
