import { useLayoutEffect, useRef, useState, type ReactNode } from "react";
import styles from "./Tooltip.module.css";

interface TooltipProps {
  label: string;
  children: ReactNode;
  side?: "top" | "bottom";
}

const VIEWPORT_MARGIN = 8;
const SHOW_DELAY_MS = 220;

/**
 * Hover/focus tooltip for icon-only actions. Position is computed in JS
 * against actual viewport bounds (position: fixed + clamped left/top), not
 * assumed from the trigger's alignment — a trigger near any window edge
 * still gets a fully on-screen bubble. This also sidesteps clipping from
 * scrollable ancestors, since `position: fixed` isn't contained by an
 * ancestor's `overflow: auto/hidden` the way `position: absolute` is.
 */
export function Tooltip({ label, children, side = "top" }: TooltipProps) {
  const [visible, setVisible] = useState(false);
  const [pos, setPos] = useState<{ left: number; top: number } | null>(null);
  const triggerRef = useRef<HTMLSpanElement>(null);
  const bubbleRef = useRef<HTMLSpanElement>(null);
  const showTimer = useRef<number | undefined>(undefined);

  useLayoutEffect(() => {
    if (!visible) return;
    const trigger = triggerRef.current;
    const bubble = bubbleRef.current;
    if (!trigger || !bubble) return;

    const triggerRect = trigger.getBoundingClientRect();
    const bubbleRect = bubble.getBoundingClientRect();

    const idealLeft = triggerRect.left + triggerRect.width / 2 - bubbleRect.width / 2;
    const left = Math.max(
      VIEWPORT_MARGIN,
      Math.min(idealLeft, window.innerWidth - bubbleRect.width - VIEWPORT_MARGIN),
    );

    const preferredTop =
      side === "bottom" ? triggerRect.bottom + 6 : triggerRect.top - bubbleRect.height - 6;
    // Flip to the other side if there's no room, rather than clamping into the trigger itself.
    const top =
      preferredTop < VIEWPORT_MARGIN
        ? triggerRect.bottom + 6
        : preferredTop + bubbleRect.height > window.innerHeight - VIEWPORT_MARGIN
          ? triggerRect.top - bubbleRect.height - 6
          : preferredTop;

    setPos({ left, top });
  }, [visible, side, label]);

  function show() {
    window.clearTimeout(showTimer.current);
    showTimer.current = window.setTimeout(() => setVisible(true), SHOW_DELAY_MS);
  }

  function hide() {
    window.clearTimeout(showTimer.current);
    setVisible(false);
  }

  return (
    <span
      ref={triggerRef}
      className={styles.wrapper}
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
    >
      {children}
      <span
        ref={bubbleRef}
        role="tooltip"
        className={[styles.bubble, visible && pos ? styles.visible : ""].join(" ")}
        style={pos ? { left: pos.left, top: pos.top } : undefined}
      >
        {label}
      </span>
    </span>
  );
}
