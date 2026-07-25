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
        title="Nenhum pack selecionado"
        description="Escolha um pack na Biblioteca para editar os sons de cada evento do Windows."
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
          label="Voltar para a Biblioteca"
          icon={<ChevronRightIcon style={{ transform: "rotate(180deg)" }} />}
          onClick={() => setView("library")}
        />
        <div className={styles.headerInfo}>
          <h1 className={styles.title}>{selectedPack.name}</h1>
          <p className={styles.subtitle}>{selectedPack.assignments.length} eventos do Windows</p>
        </div>
        <div className={styles.headerActions}>
          {editor.dirty && (
            <Button variant="ghost" icon={<UndoIcon size={14} />} onClick={editor.reset}>
              Descartar alterações
            </Button>
          )}
          <Button variant="primary" onClick={openApplyDialog}>
            Aplicar pack
          </Button>
        </div>
      </header>

      <div className={styles.content}>
        <div className={styles.inner}>
          {editor.dirty && (
            <div style={{ marginBottom: "var(--space-4)" }}>
              <StatusBanner
                severity="info"
                title="Você fez alterações não aplicadas"
                description="Elas serão incluídas no resumo ao aplicar este pack."
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
