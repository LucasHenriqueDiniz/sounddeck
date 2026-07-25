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

export function AppShell() {
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
          <span className={styles.brandMark} aria-hidden="true" />
          <span className={styles.brandName}>SoundDeck</span>
        </div>
        <AppNavigation />
        <div className={styles.titlebarSpacer} />
        <div className={styles.titlebarStatus}>
          {nativeUnavailable && (
            <IconButton
              label="Recurso nativo indisponível — aplicação real ao Windows desativada"
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
            title="O esquema de sons do Windows foi alterado fora do SoundDeck"
            description={
              appliedPack
                ? `A última referência conhecida era "${appliedPack.name}". Sincronize para confirmar o estado atual.`
                : "Sincronize para confirmar o estado atual antes de aplicar um novo pack."
            }
            action={
              <IconButton
                label="Sincronizar novamente"
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
