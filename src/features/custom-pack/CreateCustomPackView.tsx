import { useState } from "react";
import { Button } from "../../components/Button";
import { IconButton } from "../../components/IconButton";
import { StatusBanner } from "../../components/StatusBanner";
import { ChevronRightIcon } from "../../components/icons/icons";
import { SoundEventList } from "../sound-events/SoundEventList";
import { saveCustomPack } from "../../services/tauri/customPackService";
import type { SoundPack } from "../../types/pack";
import { useCreateCustomPack } from "./useCreateCustomPack";
import { useT } from "../../i18n";
import styles from "./CreateCustomPackView.module.css";

interface CreateCustomPackViewProps {
  onCancel: () => void;
  onCreated: (pack: SoundPack) => void;
}

export function CreateCustomPackView({ onCancel, onCreated }: CreateCustomPackViewProps) {
  const t = useT();
  const { name, setName, assignments, useDefault, disable, replaceFile, soundCount } =
    useCreateCustomPack();
  const [error, setError] = useState<string | null>(null);

  function handleSave() {
    const trimmed = name.trim();
    if (!trimmed) {
      setError(t("customPack.nameRequired"));
      return;
    }
    if (soundCount === 0) {
      setError(t("customPack.needsSound"));
      return;
    }
    const pack = saveCustomPack({
      name: trimmed,
      author: t("customPack.you"),
      description: t("customPack.autoDescription", { count: soundCount }),
      assignments,
    });
    onCreated(pack);
  }

  return (
    <div className={styles.wrapper}>
      <header className={styles.header}>
        <IconButton
          label={t("library.back")}
          icon={<ChevronRightIcon style={{ transform: "rotate(180deg)" }} />}
          onClick={onCancel}
        />
        <div className={styles.headerInfo}>
          <h1 className={styles.title}>{t("customPack.title")}</h1>
          <p className={styles.subtitle}>{t("customPack.subtitle")}</p>
        </div>
        <div className={styles.headerActions}>
          <Button variant="ghost" onClick={onCancel}>
            {t("common.cancel")}
          </Button>
          <Button variant="primary" onClick={handleSave}>
            {t("customPack.save")}
          </Button>
        </div>
      </header>

      <div className={styles.content}>
        <div className={styles.inner}>
          {error && (
            <div className={styles.errorBanner}>
              <StatusBanner severity="danger" title={error} onDismiss={() => setError(null)} />
            </div>
          )}

          <label className={styles.nameField}>
            <span className={styles.nameLabel}>{t("customPack.nameLabel")}</span>
            <input
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder={t("customPack.namePlaceholder")}
              maxLength={60}
            />
          </label>

          <p className={styles.eventsHint}>{t("customPack.eventsHint")}</p>

          <SoundEventList
            assignments={assignments}
            onUseDefault={useDefault}
            onDisable={disable}
            onReplace={replaceFile}
          />
        </div>
      </div>
    </div>
  );
}
