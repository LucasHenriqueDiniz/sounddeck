import { useEffect, useRef, type ReactNode } from "react";
import styles from "./Dialog.module.css";

interface DialogProps {
  open: boolean;
  title: string;
  description?: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
  /** Prevents Esc/backdrop dismissal while a native operation is in flight. */
  preventDismiss?: boolean;
  size?: "md" | "lg";
}

/**
 * Uses the native <dialog> element: free focus trap, native Esc handling
 * (via the "cancel" event) and correct accessibility semantics.
 */
export function Dialog({
  open,
  title,
  description,
  onClose,
  children,
  footer,
  preventDismiss = false,
  size = "md",
}: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const lastFocused = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;

    if (open && !dialog.open) {
      lastFocused.current = document.activeElement as HTMLElement | null;
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;

    const handleCancel = (event: Event) => {
      if (preventDismiss) {
        event.preventDefault();
        return;
      }
      onClose();
    };
    const handleClose = () => {
      lastFocused.current?.focus();
    };
    const handleBackdropClick = (event: MouseEvent) => {
      if (preventDismiss) return;
      if (event.target === dialog) onClose();
    };

    dialog.addEventListener("cancel", handleCancel);
    dialog.addEventListener("close", handleClose);
    dialog.addEventListener("click", handleBackdropClick);
    return () => {
      dialog.removeEventListener("cancel", handleCancel);
      dialog.removeEventListener("close", handleClose);
      dialog.removeEventListener("click", handleBackdropClick);
    };
  }, [onClose, preventDismiss]);

  return (
    <dialog
      ref={ref}
      className={[styles.dialog, styles[size]].join(" ")}
      aria-labelledby="dialog-title"
      aria-describedby={description ? "dialog-description" : undefined}
    >
      <div className={styles.content}>
        <header className={styles.header}>
          <h2 id="dialog-title" className={styles.title}>
            {title}
          </h2>
          {description && (
            <p id="dialog-description" className={styles.description}>
              {description}
            </p>
          )}
        </header>
        <div className={styles.body}>{children}</div>
        {footer && <footer className={styles.footer}>{footer}</footer>}
      </div>
    </dialog>
  );
}
