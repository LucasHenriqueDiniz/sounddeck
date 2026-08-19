import { useEffect, useState } from 'react';

/**
 * Resolves the newest published installer straight from the GitHub releases
 * API, the same way the app's own update check does.
 *
 * Two things this deliberately does not do:
 *
 * - It doesn't hardcode a version or a filename. Both change every release,
 *   and a stale hardcoded link is worse than no link — it 404s silently.
 * - It doesn't use /releases/latest. The workflow publishes drafts, and that
 *   endpoint would return the newest *published* one only after someone
 *   promotes it, so the full list is filtered instead.
 */

const REPO = 'LucasHenriqueDiniz/sounddeck';

interface GitHubAsset {
  name: string;
  browser_download_url: string;
}

interface GitHubRelease {
  tag_name: string;
  draft: boolean;
  prerelease: boolean;
  assets: GitHubAsset[];
}

export interface LatestRelease {
  version: string;
  /** The NSIS installer — the one a person clicking "Download" wants. */
  downloadUrl: string;
}

export function useLatestRelease(): { release: LatestRelease | null; failed: boolean } {
  const [release, setRelease] = useState<LatestRelease | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;

    fetch(`https://api.github.com/repos/${REPO}/releases`)
      .then((response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.json() as Promise<GitHubRelease[]>;
      })
      .then((releases) => {
        const published = releases.find((r) => !r.draft && !r.prerelease);
        const installer = published?.assets.find((a) => a.name.endsWith('.exe'));
        if (cancelled) return;
        if (published && installer) {
          setRelease({
            version: published.tag_name.replace(/^v/, ''),
            downloadUrl: installer.browser_download_url,
          });
        } else {
          setFailed(true);
        }
      })
      .catch(() => {
        // Rate limiting is the likely cause and it's transient. The UI falls
        // back to the releases page rather than showing a dead button.
        if (!cancelled) setFailed(true);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { release, failed };
}

export const RELEASES_URL = `https://github.com/${REPO}/releases/latest`;
