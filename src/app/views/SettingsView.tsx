import { Button } from "../../components/Button";
import { StatusBanner } from "../../components/StatusBanner";
import { Tabs } from "../../components/Tabs";
import { MoonIcon, RefreshIcon, SettingsIcon, SunIcon } from "../../components/icons/icons";
import { useAppState } from "../AppState";
import styles from "./SettingsView.module.css";

export function SettingsView() {
  const { theme, setTheme, nativeCapability, recheckNativeCapability, triggerExternalChangeDemo } =
    useAppState();

  return (
    <div className={styles.wrapper}>
      <div className={styles.inner}>
        <section className={styles.section}>
          <h1 className={styles.sectionTitle}>Appearance</h1>
          <div className={styles.row}>
            <div className={styles.rowInfo}>
              <span className={styles.rowTitle}>Theme</span>
              <span className={styles.rowDescription}>Light, dark, or follow the system.</span>
            </div>
            <Tabs
              aria-label="Theme"
              value={theme}
              onChange={setTheme}
              items={[
                { id: "light", label: "Light", icon: <SunIcon size={14} /> },
                { id: "dark", label: "Dark", icon: <MoonIcon size={14} /> },
                { id: "system", label: "System", icon: <SettingsIcon size={14} /> },
              ]}
            />
          </div>
        </section>

        <section className={styles.section}>
          <h1 className={styles.sectionTitle}>Diagnostics</h1>
          <div className={styles.diagnostics}>
            {nativeCapability.status === "loading" && (
              <StatusBanner severity="info" title="Checking access to the Windows registry…" />
            )}
            {nativeCapability.status === "success" && (
              <StatusBanner
                severity={nativeCapability.data.available ? "success" : "warning"}
                title={
                  nativeCapability.data.available
                    ? "Native capability available"
                    : "Native capability unavailable"
                }
                description={nativeCapability.data.message}
                action={
                  <Button
                    variant="secondary"
                    size="sm"
                    icon={<RefreshIcon size={14} />}
                    onClick={recheckNativeCapability}
                  >
                    Check again
                  </Button>
                }
              />
            )}
            {nativeCapability.status === "error" && (
              <StatusBanner
                severity="danger"
                title="Could not check the native capability"
                description={nativeCapability.message}
                action={
                  <Button variant="secondary" size="sm" onClick={recheckNativeCapability}>
                    Tentar novamente
                  </Button>
                }
              />
            )}
          </div>

          <div className={styles.row}>
            <div className={styles.rowInfo}>
              <span className={styles.rowTitle}>Simulate an external change</span>
              <span className={styles.rowDescription}>
                Demo tool: simulates another program changing the Windows sound scheme while SoundDeck
                is open.
              </span>
            </div>
            <Button variant="secondary" size="sm" onClick={triggerExternalChangeDemo}>
              Simulate
            </Button>
          </div>
        </section>

        <section className={styles.section}>
          <h1 className={styles.sectionTitle}>About</h1>
          <p className={styles.about}>
            SoundDeck 0.1.0 — a sound scheme manager for Windows 10 and 11. The library already shows
            real packs; applying to the system and the backup history are still simulated.
          </p>
          <ul className={styles.limitations}>
            <li>
              The pack library and the audio previews come from a real, publicly hosted catalog (28
              classic schemes). Packs from any other origin play a synthesized tone instead of the file.
            </li>
            <li>Events per pack reflect the real files of each scheme — not every pack covers every event.</li>
            <li>Applying a pack still simulates the phases — nothing is written to the registry yet.</li>
            <li>Backups are demo data; they do not come from the system.</li>
            <li>
              Real registry reads (the diagnostics above) and the native file picker are already wired
              up.
            </li>
          </ul>
          <p className={styles.credit}>
            Thanks to{" "}
            <a href="https://lelegofrog.github.io/wav.html" target="_blank" rel="noreferrer">
              lelegofrog.github.io
            </a>{" "}
            for the archive of classic Windows sound schemes.
          </p>
        </section>
      </div>
    </div>
  );
}
