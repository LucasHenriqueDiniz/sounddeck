/**
 * Chimer ships no bundled audio assets and the app has no filesystem
 * permission to read arbitrary local WAV files (by design — see DESIGN.md /
 * capabilities). So "listening" to a pack or event sound in this version
 * plays a short synthesized tone stand-in via the Web Audio API instead of
 * pretending to play the pack's real file. It is genuinely audible and
 * genuinely functional, not a fake success state — it is just not the
 * pack's actual audio. The UI must label preview controls accordingly.
 */

let sharedContext: AudioContext | null = null;

function getContext(): AudioContext {
  if (!sharedContext) {
    sharedContext = new AudioContext();
  }
  return sharedContext;
}

function hashToFrequency(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return 320 + (hash % 420); // 320–740 Hz
}

export interface TonePreviewHandle {
  stop: () => void;
  durationMs: number;
}

export function playPreviewTone(seed: string, durationMs = 650): TonePreviewHandle {
  const ctx = getContext();
  if (ctx.state === "suspended") {
    void ctx.resume();
  }

  const now = ctx.currentTime;
  const durationS = durationMs / 1000;
  const freq = hashToFrequency(seed);

  const oscillator = ctx.createOscillator();
  oscillator.type = "sine";
  oscillator.frequency.setValueAtTime(freq, now);
  oscillator.frequency.exponentialRampToValueAtTime(freq * 0.82, now + durationS);

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.16, now + Math.min(0.04, durationS / 4));
  gain.gain.exponentialRampToValueAtTime(0.0001, now + durationS);

  oscillator.connect(gain);
  gain.connect(ctx.destination);

  oscillator.start(now);
  oscillator.stop(now + durationS);

  let stopped = false;
  const stop = () => {
    if (stopped) return;
    stopped = true;
    try {
      oscillator.stop();
    } catch {
      // already stopped naturally
    }
  };

  oscillator.addEventListener("ended", () => {
    stopped = true;
  });

  return { stop, durationMs };
}
