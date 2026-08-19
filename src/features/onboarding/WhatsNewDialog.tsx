import { useEffect, useState } from "react";
import { Button } from "../../components/Button";
import { Dialog } from "../../components/Dialog";
import {
  fetchNotesForCurrentVersion,
  getCurrentVersion,
  type ReleaseInfo,
} from "../../services/releases/releaseService";
import { useT } from "../../i18n";
import styles from "./Onboarding.module.css";

/**
 * Shown once after an upgrade. Notes come from the GitHub release body, so
 * there's no second copy of the changelog to maintain in the app. If they
 * can't be fetched (offline, rate-limited) the dialog closes itself rather
 * than showing an empty shell — the version marker is already written, so it
 * simply won't nag again.
 */
export function WhatsNewDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const t = useT();
  const [release, setRelease] = useState<ReleaseInfo | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!open) return;
    let active = true;
    fetchNotesForCurrentVersion()
      .then((info) => {
        if (!active) return;
        if (info && info.notes.length > 0) setRelease(info);
        else setFailed(true);
      })
      .catch(() => active && setFailed(true));
    return () => {
      active = false;
    };
  }, [open]);

  useEffect(() => {
    if (failed) onClose();
  }, [failed, onClose]);

  if (!release) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={t("whatsNew.title", { version: getCurrentVersion() })}
      description={t("whatsNew.subtitle")}
      footer={
        <Button variant="primary" onClick={onClose}>
          {t("common.done")}
        </Button>
      }
    >
      <ul className={styles.notes}>
        {release.notes.map((note) => (
          <li key={note}>{note}</li>
        ))}
      </ul>
    </Dialog>
  );
}
