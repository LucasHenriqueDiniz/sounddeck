import { useEffect, useState } from "react";
import { checkForUpdate, type ReleaseInfo } from "../../services/releases/releaseService";

/**
 * Checks once per mount whether a newer release exists. Failures are
 * swallowed: not knowing about an update is a non-event, and an error banner
 * for it would be noise.
 */
export function useUpdateCheck() {
  const [update, setUpdate] = useState<ReleaseInfo | null>(null);

  useEffect(() => {
    let active = true;
    checkForUpdate()
      .then((info) => active && setUpdate(info))
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  return update;
}
