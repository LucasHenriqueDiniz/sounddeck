import { version as currentVersion } from "../../../package.json";

/**
 * Reads this project's releases from the public GitHub API — the same source
 * the landing page's changelog uses, so there is exactly one place release
 * notes are written (the release body on GitHub) and no copy to keep in sync.
 *
 * Two consumers: the "update available" indicator, and the "what's new"
 * dialog shown after an upgrade.
 */

const REPO = "LucasHenriqueDiniz/sounddeck";
const RELEASES_URL = `https://api.github.com/repos/${REPO}/releases`;
const CACHE_KEY = "sounddeck.releaseCheck";
/** GitHub rate-limits unauthenticated calls; once every 6h is plenty. */
const CACHE_TTL_MS = 6 * 60 * 60 * 1000;

export interface ReleaseInfo {
  version: string;
  url: string;
  /** Release body, one entry per non-empty line. */
  notes: string[];
}

interface CachedCheck {
  fetchedAt: number;
  releases: ReleaseInfo[];
}

export function getCurrentVersion(): string {
  return currentVersion;
}

/** Strips a leading "v" and any pre-release suffix. */
function parseVersion(tag: string): number[] {
  return tag
    .replace(/^v/i, "")
    .split("-")[0]
    .split(".")
    .map((part) => Number.parseInt(part, 10) || 0);
}

/** Returns > 0 when `a` is newer than `b`. */
export function compareVersions(a: string, b: string): number {
  const left = parseVersion(a);
  const right = parseVersion(b);
  const length = Math.max(left.length, right.length);
  for (let i = 0; i < length; i += 1) {
    const diff = (left[i] ?? 0) - (right[i] ?? 0);
    if (diff !== 0) return diff;
  }
  return 0;
}

function readCache(): CachedCheck | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CachedCheck;
    if (Date.now() - parsed.fetchedAt > CACHE_TTL_MS) return null;
    return parsed;
  } catch {
    return null;
  }
}

interface GitHubRelease {
  tag_name: string;
  html_url: string;
  body: string | null;
  draft: boolean;
  prerelease: boolean;
}

export async function fetchReleases(): Promise<ReleaseInfo[]> {
  const cached = readCache();
  if (cached) return cached.releases;

  const response = await fetch(RELEASES_URL);
  if (!response.ok) throw new Error(`GitHub API returned ${response.status}`);
  const raw = (await response.json()) as GitHubRelease[];

  const releases: ReleaseInfo[] = raw
    .filter((r) => !r.draft && !r.prerelease)
    .map((r) => ({
      version: r.tag_name,
      url: r.html_url,
      notes: (r.body ?? "")
        .split("\n")
        .map((line) => line.trim().replace(/^[-*]\s*/, ""))
        .filter(Boolean),
    }));

  try {
    localStorage.setItem(
      CACHE_KEY,
      JSON.stringify({ fetchedAt: Date.now(), releases } satisfies CachedCheck),
    );
  } catch {
    // Cache is an optimisation; a failure here just means we refetch later.
  }
  return releases;
}

/** The newest published release, or null if it isn't newer than this build. */
export async function checkForUpdate(): Promise<ReleaseInfo | null> {
  const releases = await fetchReleases();
  const latest = releases[0];
  if (!latest) return null;
  return compareVersions(latest.version, currentVersion) > 0 ? latest : null;
}

/** Notes for the running build, used by the "what's new" dialog. */
export async function fetchNotesForCurrentVersion(): Promise<ReleaseInfo | null> {
  const releases = await fetchReleases();
  return releases.find((r) => compareVersions(r.version, currentVersion) === 0) ?? null;
}
