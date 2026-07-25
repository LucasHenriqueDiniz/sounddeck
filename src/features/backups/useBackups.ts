import { useCallback, useEffect, useState } from "react";
import type { AsyncState } from "../../types/async";
import type { BackupEntry } from "../../types/backup";
import { listBackups, restoreBackup } from "../../services/tauri/backupService";

/**
 * `version` bumps whenever something outside this hook changes the backup
 * set (currently: a successful pack apply — see AppState's
 * `backupsVersion`). Panels stay mounted across tab switches (AppShell uses
 * `hidden`, not unmount/remount), so a mount-only fetch would otherwise go
 * stale the moment a backup is created from another tab.
 */
export function useBackups(version = 0) {
  const [state, setState] = useState<AsyncState<BackupEntry[]>>({ status: "idle" });
  const [restoringId, setRestoringId] = useState<string | null>(null);
  const [restoreError, setRestoreError] = useState<string | null>(null);
  const [restoredId, setRestoredId] = useState<string | null>(null);

  const load = useCallback(() => {
    setState({ status: "loading" });
    listBackups()
      .then((data) => setState({ status: "success", data }))
      .catch((error: unknown) => setState({ status: "error", message: String(error) }));
  }, []);

  useEffect(() => {
    load();
    // `version` intentionally retriggers this effect on external changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [load, version]);

  async function restore(id: string) {
    setRestoringId(id);
    setRestoreError(null);
    const result = await restoreBackup(id);
    setRestoringId(null);
    if (result.ok) {
      setRestoredId(id);
    } else {
      setRestoreError(result.message);
    }
  }

  return { state, reload: load, restore, restoringId, restoreError, restoredId, clearRestoredId: () => setRestoredId(null) };
}
