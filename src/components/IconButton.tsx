import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Tooltip } from "./Tooltip";
import styles from "./IconButton.module.css";

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  icon: ReactNode;
  variant?: "default" | "ghost" | "accent";
  size?: "sm" | "md";
  showTooltip?: boolean;
}

/** Icon-only action button. Always carries an accessible name and, by default, a tooltip. */
export function IconButton({
  label,
  icon,
  variant = "ghost",
  size = "md",
  showTooltip = true,
  className,
  ...rest
}: IconButtonProps) {
  const button = (
    <button
      className={[styles.button, styles[variant], styles[size], className].filter(Boolean).join(" ")}
      aria-label={label}
      title={showTooltip ? undefined : label}
      {...rest}
    >
      {icon}
    </button>
  );

  if (!showTooltip) return button;
  return <Tooltip label={label}>{button}</Tooltip>;
}
