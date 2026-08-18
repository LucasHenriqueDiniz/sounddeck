import { Button } from "../../components/Button";
import { EmptyState } from "../../components/EmptyState";
import { IconButton } from "../../components/IconButton";
import { StatusBanner } from "../../components/StatusBanner";
import { ChevronRightIcon, EditorIcon, UndoIcon } from "../../components/icons/icons";
import { SoundEventList } from "../../features/sound-events/SoundEventList";
import { useAppState } from "../AppState";
import styles from "./EditorView.module.css";

export function EditorView() {
  const { selectedPack, editor, setView, openApplyDialog } = useAppState();

  if (!selectedPack) {
    return (
      <EmptyState
        icon={<EditorIcon size={30} />}
        title="No pack selected"
        description="Pick a pack in the Library to edit the sound of each Windows event."
        action={
          <Button variant="primary" onClick={() => setView("library")}>
            Ir para a Biblioteca
          </Button>
        }
      />
    );
  }

  return (
    <div className={styles.wrapper}>
      <header className={styles.header}>
        <IconButton
          label="Back to the library"
          icon={<ChevronRightIcon style={{ transform: "rotate(180deg)" }} />}
          onClick={() => setView("library")}
        />
        <div className={styles.headerInfo}>
          <h1 className={styles.title}>{selectedPack.name}</h1>
          <p className={styles.subtitle}>{selectedPack.assignments.length} Windows events</p>
        </div>
        <div className={styles.headerActions}>
          {editor.dirty && (
            <Button variant="ghost" icon={<UndoIcon size={14} />} onClick={editor.reset}>
              Discard changes
            </Button>
          )}
          <Button variant="primary" onClick={openApplyDialog}>
            Apply pack
          </Button>
        </div>
      </header>

      <div className={styles.content}>
        <div className={styles.inner}>
          {editor.dirty && (
            <div style={{ marginBottom: "var(--space-4)" }}>
              <StatusBanner
                severity="info"
                title="You have unapplied changes"
                description="They will be included in the summary when you apply this pack."
              />
            </div>
          )}
          <SoundEventList
            assignments={editor.assignments}
            onUseDefault={editor.useDefault}
            onDisable={editor.disable}
            onReplace={editor.replaceFile}
            packId={selectedPack.id}
            remoteBaseUrl={selectedPack.remoteBaseUrl}
          />
        </div>
      </div>
    </div>
  );
}
