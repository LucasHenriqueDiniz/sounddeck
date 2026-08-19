import { useEffect, useState } from 'react';

/**
 * Release data straight from the GitHub API, the same source the app's own
 * update check uses.
 *
 * Two things this deliberately does not do:
 *
 * - It doesn't hardcode a version or a filename. Both change every release,
 *   and a stale hardcoded link is worse than no link — it 404s silently.
 * - It doesn't use /releases/latest. The workflow publishes drafts, so that
 *   endpoint only reflects a release once someone promotes it; the full list
 *   is filtered instead.
 */

const REPO = 'LucasHenriqueDiniz/sounddeck';
export const REPO_URL = `https://github.com/${REPO}`;
export const RELEASES_URL = `${REPO_URL}/releases/latest`;

export interface ReleaseAsset {
  name: string;
  browser_download_url: string;
}

export interface Release {
  tag_name: string;
  published_at: string;
  html_url: string;
  body: string;
  draft: boolean;
  prerelease: boolean;
  assets: ReleaseAsset[];
}

/** Shared across pages so a nav + page render doesn't cost two API calls. */
let cache: Promise<Release[]> | null = null;

function fetchReleases(): Promise<Release[]> {
  if (!cache) {
    cache = fetch(`https://api.github.com/repos/${REPO}/releases`)
      .then((response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.json() as Promise<Release[]>;
      })
      .then((releases) => releases.filter((r) => !r.draft && !r.prerelease))
      .catch(() => {
        // Rate limiting is the likely cause and it's transient — don't poison
        // the cache, so a later page view can try again.
        cache = null;
        return [];
      });
  }
  return cache;
}

export function useReleases(): { releases: Release[]; loading: boolean } {
  const [releases, setReleases] = useState<Release[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    void fetchReleases().then((list) => {
      if (cancelled) return;
      setReleases(list);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return { releases, loading };
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
    void fetchReleases().then((list) => {
      if (cancelled) return;
      const newest = list[0];
      const installer = newest?.assets.find((a) => a.name.endsWith('.exe'));
      if (newest && installer) {
        setRelease({ version: newest.tag_name.replace(/^v/, ''), downloadUrl: installer.browser_download_url });
      } else {
        setFailed(true);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return { release, failed };
}
