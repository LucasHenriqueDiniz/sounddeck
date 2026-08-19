import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";
import { Tooltip } from "./Tooltip";
import styles from "./IconButton.module.css";

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  icon: ReactNode;
  variant?: "default" | "ghost" | "accent";
  size?: "sm" | "md";
  showTooltip?: boolean;
  href?: undefined;
}

interface IconLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  label: string;
  icon: ReactNode;
  variant?: "default" | "ghost" | "accent";
  size?: "sm" | "md";
  showTooltip?: boolean;
  href: string;
}

/**
 * Icon-only action button. Always carries an accessible name and, by
 * default, a tooltip. Pass `href` to render an external link instead of a
 * button — same look, `target="_blank"` and `rel="noreferrer"` by default.
 */
export function IconButton(props: IconButtonProps | IconLinkProps) {
  const { label, icon, variant = "ghost", size = "md", showTooltip = true, className, ...rest } = props;
  const classes = [styles.button, styles[variant], styles[size], className].filter(Boolean).join(" ");

  const element =
    "href" in rest && rest.href !== undefined ? (
      <a
        className={classes}
        aria-label={label}
        title={showTooltip ? undefined : label}
        target="_blank"
        rel="noreferrer"
        {...(rest as AnchorHTMLAttributes<HTMLAnchorElement>)}
      >
        {icon}
      </a>
    ) : (
      <button
        className={classes}
        aria-label={label}
        title={showTooltip ? undefined : label}
        {...(rest as ButtonHTMLAttributes<HTMLButtonElement>)}
      >
        {icon}
      </button>
    );

  if (!showTooltip) return element;
  return <Tooltip label={label}>{element}</Tooltip>;
}
