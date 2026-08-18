import { IconButton } from "../components/IconButton";
import { StatusBanner } from "../components/StatusBanner";
import { PlugOffIcon, RefreshIcon } from "../components/icons/icons";
import { ApplyPackDialog } from "../features/apply-pack/ApplyPackDialog";
import { AppNavigation } from "./AppNavigation";
import { WindowControls } from "./WindowControls";
import { useAppState } from "./AppState";
import { LibraryView } from "./views/LibraryView";
import { EditorView } from "./views/EditorView";
import { BackupsView } from "./views/BackupsView";
import { SettingsView } from "./views/SettingsView";
import styles from "./AppShell.module.css";
import { useT } from "../i18n";

export function AppShell() {
  const t = useT();
  const {
    view,
    nativeCapability,
    externallyChanged,
    acknowledgeExternalChange,
    appliedPackId,
    packsState,
    selectedPack,
    applyDialogOpen,
    closeApplyDialog,
    onApplySuccess,
  } = useAppState();

  const nativeUnavailable = nativeCapability.status === "success" && !nativeCapability.data.available;
  const appliedPack =
    packsState.status === "success" ? packsState.data.find((p) => p.id === appliedPackId) : undefined;

  return (
    <div className={styles.shell}>
      <header className={styles.titlebar} data-tauri-drag-region="deep">
        <div className={styles.brand}>
          <img className={styles.brandMark} src="/favicon.png" alt="" aria-hidden="true" />
          <span className={styles.brandName}>SoundDeck</span>
        </div>
        <AppNavigation />
        <div className={styles.titlebarSpacer} />
        <div className={styles.titlebarStatus}>
          {nativeUnavailable && (
            <IconButton
              label={t("shell.nativeUnavailable")}
              icon={<PlugOffIcon />}
              variant="ghost"
            />
          )}
        </div>
        <WindowControls />
      </header>

      <div className={styles.banners}>
        {externallyChanged && (
          <StatusBanner
            severity="warning"
            title={t("shell.externalChange.title")}
            description={
              appliedPack
                ? t("shell.externalChange.known", { pack: appliedPack.name })
                : t("shell.externalChange.unknown")
            }
            action={
              <IconButton
                label={t("shell.resync")}
                icon={<RefreshIcon />}
                variant="default"
                onClick={acknowledgeExternalChange}
              />
            }
          />
        )}
      </div>

      <div className={styles.content}>
        <section
          id="panel-library"
          role="tabpanel"
          aria-labelledby="tab-library"
          hidden={view !== "library"}
          className={styles.panel}
        >
          <LibraryView />
        </section>
        <section
          id="panel-editor"
          role="tabpanel"
          aria-labelledby="tab-editor"
          hidden={view !== "editor"}
          className={styles.panel}
        >
          <EditorView />
        </section>
        <section
          id="panel-backups"
          role="tabpanel"
          aria-labelledby="tab-backups"
          hidden={view !== "backups"}
          className={styles.panel}
        >
          <BackupsView />
        </section>
        <section
          id="panel-settings"
          role="tabpanel"
          aria-labelledby="tab-settings"
          hidden={view !== "settings"}
          className={styles.panel}
        >
          <SettingsView />
        </section>
      </div>

      <ApplyPackDialog
        pack={selectedPack}
        open={applyDialogOpen}
        onClose={closeApplyDialog}
        onApplied={onApplySuccess}
      />
    </div>
  );
}
