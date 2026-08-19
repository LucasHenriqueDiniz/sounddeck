import type { SoundPack } from "../../types/pack";
import { resolvePackFileUrl } from "../tauri/remoteCatalogService";

/**
 * Plays one sound from the pack that was just applied, as the confirmation
 * that it landed. The point is that you *hear* the change immediately rather
 * than reading that it happened.
 *
 * It deliberately plays a real file from the pack and never the synthesized
 * tone used elsewhere for previews: a generic beep would confirm nothing about
 * the scheme that was just written. A pack with no playable audio — a custom
 * pack, whose .wav files live outside the app's reach — stays silent instead.
 */

/**
 * Events worth hearing, best first. The logon chime is the signature sound of
 * every one of these schemes, so it's the one that actually says "XP" or
 * "Vista"; the rest are fallbacks for packs that don't ship it.
 */
const PREFERRED_EVENTS = [
  "WindowsLogon",
  "SystemAsterisk",
  "DeviceConnect",
  "Notification.Default",
  "SystemExclamation",
  ".Default",
];

/** Loud enough to notice, quiet enough not to startle. */
const VOLUME = 0.7;

export function resolveConfirmationSoundUrl(pack: SoundPack): string | null {
  if (!pack.remoteBaseUrl) return null;

  const playable = pack.assignments.filter((a) => a.state === "pack" && a.fileName);
  if (playable.length === 0) return null;

  for (const event of PREFERRED_EVENTS) {
    const match = playable.find((a) => a.eventId.event === event);
    if (match?.fileName) {
      return resolvePackFileUrl(pack.remoteBaseUrl, pack.id, match.fileName);
    }
  }

  // Nothing from the preferred list — any sound from the pack beats silence.
  const fallback = playable[0];
  return fallback.fileName ? resolvePackFileUrl(pack.remoteBaseUrl, pack.id, fallback.fileName) : null;
}

export function playPackConfirmation(pack: SoundPack): void {
  const url = resolveConfirmationSoundUrl(pack);
  if (!url) return;

  try {
    const audio = new Audio(url);
    audio.volume = VOLUME;
    // Autoplay can be refused and the file may 404. Neither is worth
    // surfacing: the apply itself already succeeded and was verified.
    void audio.play().catch(() => {});
  } catch {
    // Audio is unavailable in this environment; nothing to recover from.
  }
}
