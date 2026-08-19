import { Button } from "../../components/Button";
import { EmptyState } from "../../components/EmptyState";
import { IconButton } from "../../components/IconButton";
import { StatusBanner } from "../../components/StatusBanner";
import { ChevronRightIcon, EditorIcon, UndoIcon } from "../../components/icons/icons";
import { SoundEventList } from "../../features/sound-events/SoundEventList";
import { useAppState } from "../AppState";
import styles from "./EditorView.module.css";
import { useT } from "../../i18n";

export function EditorView() {
  const t = useT();
  const { selectedPack, editor, setView, openApplyDialog, packsState } = useAppState();
  // Every pack the library knows about, so any event can borrow a sound from
  // any pack that has one.
  const library = packsState.status === "success" ? packsState.data : [];

  if (!selectedPack) {
    return (
      <EmptyState
        icon={<EditorIcon size={30} />}
        title={t("editor.noPack.title")}
        description={t("editor.noPack.desc")}
        action={
          <Button variant="primary" onClick={() => setView("library")}>
            {t("editor.goToLibrary")}
          </Button>
        }
      />
    );
  }

  return (
    <div className={styles.wrapper}>
      <header className={styles.header}>
        <IconButton
          label={t("library.back")}
          icon={<ChevronRightIcon style={{ transform: "rotate(180deg)" }} />}
          onClick={() => setView("library")}
        />
        <div className={styles.headerInfo}>
          <h1 className={styles.title}>{selectedPack.name}</h1>
          <p className={styles.subtitle}>{t("editor.events", { count: selectedPack.assignments.length })}</p>
        </div>
        <div className={styles.headerActions}>
          {editor.dirty && (
            <Button variant="ghost" icon={<UndoIcon size={14} />} onClick={editor.reset}>
              {t("editor.discard")}
            </Button>
          )}
          <Button variant="primary" onClick={openApplyDialog}>
            {t("pack.applyPack")}
          </Button>
        </div>
      </header>

      <div className={styles.content}>
        <div className={styles.inner}>
          {editor.dirty && (
            <div style={{ marginBottom: "var(--space-4)" }}>
              <StatusBanner
                severity="info"
                title={t("editor.unapplied.title")}
                description={t("editor.unapplied.desc")}
              />
            </div>
          )}
          <SoundEventList
            assignments={editor.assignments}
            onUseDefault={editor.useDefault}
            onDisable={editor.disable}
            onReplace={editor.replaceFile}
            onUseLibrarySound={editor.useLibrarySound}
            library={library}
            packId={selectedPack.id}
            remoteBaseUrl={selectedPack.remoteBaseUrl}
          />
        </div>
      </div>
    </div>
  );
}
