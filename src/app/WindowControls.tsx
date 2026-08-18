import { useEffect, useState } from "react";
import { getCurrentWindow } from "@tauri-apps/api/window";
import {
  WindowCloseIcon,
  WindowMaximizeIcon,
  WindowMinimizeIcon,
  WindowRestoreIcon,
} from "../components/icons/icons";
import { isRunningInTauri } from "../services/tauri/windowsSoundService";
import styles from "./WindowControls.module.css";
import { useT } from "../i18n";

/**
 * Replaces the native Windows caption buttons — decorations are turned off
 * in tauri.conf.json, so this is the only way to minimize/maximize/close.
 * Outside the Tauri runtime (e.g. `npm run dev` opened in a plain browser
 * tab, used for UI preview) the buttons render for visual review but are
 * inert: there is no real window to control.
 */
export function WindowControls() {
  const t = useT();
  const inTauri = isRunningInTauri();
  const [maximized, setMaximized] = useState(false);

  useEffect(() => {
    if (!inTauri) return;
    const appWindow = getCurrentWindow();
    let unlisten: (() => void) | undefined;

    appWindow.isMaximized().then(setMaximized);
    appWindow
      .onResized(() => {
        appWindow.isMaximized().then(setMaximized);
      })
      .then((fn) => {
        unlisten = fn;
      });

    return () => unlisten?.();
  }, [inTauri]);

  function minimize() {
    if (!inTauri) return;
    void getCurrentWindow().minimize();
  }

  function toggleMaximize() {
    if (!inTauri) return;
    void getCurrentWindow().toggleMaximize();
  }

  function close() {
    if (!inTauri) return;
    void getCurrentWindow().close();
  }

  return (
    <div className={styles.controls}>
      <button type="button" className={styles.control} aria-label={t("window.minimise")} onClick={minimize}>
        <WindowMinimizeIcon />
      </button>
      <button
        type="button"
        className={styles.control}
        aria-label={maximized ? t("window.restoreSize") : t("window.maximise")}
        onClick={toggleMaximize}
      >
        {maximized ? <WindowRestoreIcon /> : <WindowMaximizeIcon />}
      </button>
      <button
        type="button"
        className={`${styles.control} ${styles.close}`}
        aria-label={t("window.close")}
        onClick={close}
      >
        <WindowCloseIcon />
      </button>
    </div>
  );
}
