import { useState } from "react";
import { getCurrentVersion } from "../../services/releases/releaseService";

/**
 * Decides what to show on launch:
 *   "tour"      — never opened before
 *   "whatsNew"  — opened before, but on an older version
 *   null        — nothing to show
 *
 * The marker is written as soon as the decision is made, not when the dialog
 * is dismissed, so a crash or a force-quit can't make the tour reappear on
 * every launch.
 */

const SEEN_KEY = "sounddeck.lastSeenVersion";

export type FirstRunKind = "tour" | "whatsNew" | null;

function decide(): FirstRunKind {
  let seen: string | null = null;
  try {
    seen = localStorage.getItem(SEEN_KEY);
  } catch {
    // No storage means we can't tell first run from an upgrade, and showing
    // the tour on every launch would be worse than showing nothing.
    return null;
  }

  const current = getCurrentVersion();
  try {
    localStorage.setItem(SEEN_KEY, current);
  } catch {
    return null;
  }

  if (!seen) return "tour";
  return seen === current ? null : "whatsNew";
}

/**
 * Decided once, at module load. This is a launch-time question, and reading
 * it inside an effect would answer it wrong: the decision writes the marker,
 * so a second invocation — StrictMode in dev, or any remount — reads back
 * what the first one wrote and concludes there's nothing to show.
 */
const LAUNCH_DECISION: FirstRunKind = decide();

export function useFirstRun() {
  const [kind, setKind] = useState<FirstRunKind>(LAUNCH_DECISION);

  return {
    kind,
    dismiss: () => setKind(null),
    // The launch decision is one-shot by design, so without this the tour is
    // unreachable the moment the marker is written — which is exactly how it
    // went unnoticed. Settings uses this to open it again on request.
    showTour: () => setKind("tour"),
  };
}
