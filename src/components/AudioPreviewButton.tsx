import { useEffect, useRef, useState } from "react";
import { playPreviewTone, type TonePreviewHandle } from "../services/audio/tonePreview";
import { useT } from "../i18n";
import { IconButton } from "./IconButton";
import { AlertCircleIcon, PauseIcon, PlayIcon } from "./icons/icons";

interface AudioPreviewButtonProps {
  /** Distinguishes the synthesized tone fallback — same seed, same pitch. */
  seed: string;
  durationMs?: number;
  label: string;
  disabled?: boolean;
  size?: "sm" | "md";
  /** When set, streams this real file instead of the synthesized tone. */
  audioUrl?: string;
}

/**
 * Plays the pack's real audio file when `audioUrl` is known (remote-catalog
 * packs). Otherwise falls back to a short synthesized tone standing in for
 * the sound (see services/audio/tonePreview.ts — demo packs only, since
 * their file names don't correspond to any real audio).
 */
export function AudioPreviewButton({
  seed,
  durationMs = 650,
  label,
  disabled,
  size = "md",
  audioUrl,
}: AudioPreviewButtonProps) {
  const t = useT();
  const [playing, setPlaying] = useState(false);
  const [errored, setErrored] = useState(false);
  const toneHandleRef = useRef<TonePreviewHandle | null>(null);
  const audioElRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    return () => {
      toneHandleRef.current?.stop();
      audioElRef.current?.pause();
    };
  }, []);

  function stop() {
    toneHandleRef.current?.stop();
    audioElRef.current?.pause();
    setPlaying(false);
  }

  function toggle() {
    if (playing) {
      stop();
      return;
    }

    setErrored(false);

    if (audioUrl) {
      const audio = new Audio(audioUrl);
      audioElRef.current = audio;
      audio.addEventListener("ended", () => setPlaying(false));
      audio.addEventListener("error", () => {
        setErrored(true);
        setPlaying(false);
      });
      audio
        .play()
        .then(() => setPlaying(true))
        .catch(() => {
          setErrored(true);
          setPlaying(false);
        });
      return;
    }

    toneHandleRef.current = playPreviewTone(seed, durationMs);
    setPlaying(true);
    window.setTimeout(() => setPlaying(false), durationMs);
  }

  const accessibleLabel = errored
    ? t("preview.failed", { label })
    : playing
      ? t("preview.stop", { label })
      : audioUrl
        ? t("preview.play", { label })
        : t("preview.playDemo", { label });

  return (
    <IconButton
      label={accessibleLabel}
      icon={errored ? <AlertCircleIcon /> : playing ? <PauseIcon /> : <PlayIcon />}
      variant={playing ? "accent" : "default"}
      size={size}
      disabled={disabled}
      onClick={toggle}
    />
  );
}
