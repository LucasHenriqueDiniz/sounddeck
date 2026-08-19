import { useState } from "react";
import { Button } from "../../components/Button";
import { Dialog } from "../../components/Dialog";
import { BackupsIcon, EditorIcon, LibraryIcon, PlusIcon } from "../../components/icons/icons";
import { useT, type TranslationKey } from "../../i18n";
import styles from "./Onboarding.module.css";

interface Step {
  icon: React.ReactNode;
  titleKey: TranslationKey;
  bodyKey: TranslationKey;
}

const STEPS: Step[] = [
  { icon: <LibraryIcon size={22} />, titleKey: "tour.library.title", bodyKey: "tour.library.body" },
  { icon: <EditorIcon size={22} />, titleKey: "tour.editor.title", bodyKey: "tour.editor.body" },
  { icon: <BackupsIcon size={22} />, titleKey: "tour.backups.title", bodyKey: "tour.backups.body" },
  { icon: <PlusIcon size={22} />, titleKey: "tour.custom.title", bodyKey: "tour.custom.body" },
];

export function WelcomeTour({ open, onClose }: { open: boolean; onClose: () => void }) {
  const t = useT();
  const [index, setIndex] = useState(0);
  const step = STEPS[index];
  const isLast = index === STEPS.length - 1;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={t("tour.title")}
      description={t("tour.subtitle")}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            {t("tour.skip")}
          </Button>
          {index > 0 && (
            <Button variant="secondary" onClick={() => setIndex((i) => i - 1)}>
              {t("tour.back")}
            </Button>
          )}
          <Button variant="primary" onClick={() => (isLast ? onClose() : setIndex((i) => i + 1))}>
            {isLast ? t("tour.done") : t("tour.next")}
          </Button>
        </>
      }
    >
      <div className={styles.step}>
        <span className={styles.stepIcon} aria-hidden="true">
          {step.icon}
        </span>
        <div>
          <h3 className={styles.stepTitle}>{t(step.titleKey)}</h3>
          <p className={styles.stepBody}>{t(step.bodyKey)}</p>
        </div>
      </div>

      <ol className={styles.dots} aria-label={t("tour.progress", { current: index + 1, total: STEPS.length })}>
        {STEPS.map((s, i) => (
          <li
            key={s.titleKey}
            className={[styles.dot, i === index ? styles.dotActive : ""].filter(Boolean).join(" ")}
            aria-current={i === index ? "step" : undefined}
          />
        ))}
      </ol>
    </Dialog>
  );
}
