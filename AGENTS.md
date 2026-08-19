# AGENTS.md

Repository guide for coding agents (Claude Code, opencode, and the like).
Read this before touching anything.

## What this is

A desktop app for **Windows 10/11** that swaps the system sound scheme.
The user picks a pack, previews it, applies it — and the previous scheme is
saved so it can be restored. An editor swaps sounds event by event for
finer control.

Tauri 2 (Rust) + React 19 + TypeScript + Vite. **Windows-only**: the entire
backend depends on the Windows registry. There is no code path for Linux or
macOS, and it doesn't make sense to build one.

## Commands

```bash
npm install
npm run tauri dev          # full app (Rust + webview) — the normal path
npm run dev                # frontend only, in the browser, no IPC (uses src/mocks)
npm run build               # tsc + vite build
npm run tauri build         # installers under src-tauri/target/release/bundle
npm run build --prefix site  # builds the website into site/dist
```

The Rust side has round-trip tests for the registry write path. They're
`#[ignore]`d because they write to the **live** `HKCU` sound scheme — each
one restores what it touched, but a plain `cargo test` shouldn't mutate the
machine it runs on:

```bash
cd src-tauri && cargo test -- --ignored --test-threads=1
```

They cover apply/disable/Windows-default per event, the full
apply → backup → restore cycle, byte-and-type exactness on restore, and that
a missing `.wav` aborts before anything is written. Everything else is
verified manually by running the app.

## Architecture

### The Rust ↔ TypeScript boundary

All communication goes through **6 Tauri commands**, declared in
[src-tauri/src/lib.rs](src-tauri/src/lib.rs):

| Command | Does |
|---|---|
| `scan_events` | reads every sound event from the registry |
| `download_pack_asset` | downloads a `.wav` from the remote catalog (skips if already cached) |
| `apply_sound_pack` | snapshots, backs up, then writes a whole pack in one pass |
| `list_backups` | lists saved backups |
| `restore_backup` | writes a backup's snapshots back |
| `delete_backup` | removes a backup file |

`apply_sound_pack` is the only write path. It snapshots every affected event
*before* the first write and rolls back everything it already wrote if any
single event fails — a pack is never half-applied. Per-event write commands
existed once (`apply_test_sound`/`restore_sound`) and were removed: they
made it possible to mutate the live scheme outside the backup-then-verify
flow, which is exactly what this command exists to prevent.

On the TS side, each command has a wrapper under `src/services/tauri/`.
**Components never call `invoke` directly** — always through those services.
`nativeCapability.ts` detects whether the app is running inside Tauri;
outside of it the app falls back to `src/mocks/`, which is what makes
`npm run dev` work in the browser.

### Where user data lives

Everything the user creates is keyed to the bundle identifier, never to the
install path, so an upgrade or reinstall keeps it:

- **Backups** — one JSON file per backup under the app data dir
  (`%APPDATA%\com.sounddeck.app\backups\`), holding the raw registry bytes
  and type of every event an apply touched.
- **Downloaded pack audio** — `%APPDATA%\com.sounddeck.app\packs\<id>\`.
- **Custom packs, theme, language, applied-pack id** — `localStorage`, which
  WebView2 stores under `%LOCALAPPDATA%\com.sounddeck.app`.

The MSI/NSIS installers only replace program files, so none of the above is
touched on upgrade. Don't move any of it into the install directory.

### The registry model (the non-obvious part)

[src-tauri/src/windows_sound.rs](src-tauri/src/windows_sound.rs) writes to
`HKCU\AppEvents\Schemes\Apps\<app>\<event>\.Current`.

Two things here are non-obvious and already solved — don't regress on them:

1. **`.Current` is what actually plays.** The named subkeys (`.Default` and
   custom schemes) are just templates that Control Panel copies into
   `.Current` when the user switches schemes. Writing `.Current` directly
   changes the sound immediately, with no restart needed.

2. **The value's type must be preserved.** `RawValue` stores the raw bytes
   *and* the original `reg_type`. Many values are `REG_EXPAND_SZ`
   (e.g. `%SystemRoot%\Media\...`); always restoring as `REG_SZ` would
   silently corrupt the value. If you touch the restore path, keep this.

3. **A silenced event is a *zero-length* value, and they're everywhere.**
   About a third of the events on a stock install (22 of 71 on the dev
   machine) have an empty `.Current` and an empty `.Default` — that's how
   Windows spells "(None)". `windows-registry`'s `set_value` can't be handed
   those bytes directly: its debug-only null-termination check reads
   `value[len - 2]`, which underflows and **aborts the process**. It's
   compiled out of release builds, so it only ever killed `tauri dev` — but
   it killed it dead, mid-apply. All raw writes go through `write_raw_value`,
   which substitutes the canonical empty string (one UTF-16 NUL) for string
   types. Don't reintroduce a bare `set_value` on the write path.

   The reason this survived five passing registry tests: every one of them
   picked its target with `some_event_with_sound()`, so none ever wrote an
   empty value. `some_silent_event()` is the counterpart — use it when you
   add write-path coverage.

Security boundaries the app promises on the landing page and in the
README — **don't break any of them**: nothing outside `HKCU`, no system
file touched, no privilege elevation, and a backup before every write.

### Frontend

```
src/
  app/          AppShell, AppState (global state), navigation, views/
  features/     packs/ apply-pack/ sound-events/ backups/ custom-pack/ — one directory per flow
  components/   shared UI + icons/
  services/
    tauri/      wrappers around the commands (the only door into Rust)
    audio/      tonePreview.ts — synthesized preview, no file needed
  i18n/         useT() + locales/*.json — 5 languages (en/pt/es/de/fr), see below
  hooks/ lib/ types/ mocks/ styles/
```

CSS Modules per component (`Foo.module.css`). [DESIGN.md](DESIGN.md) is the
design contract — typography, semantic colors, geometry, motion. Read it
before creating a new component; it exists so the app doesn't turn into a
patchwork.

### App i18n

The UI has real i18n: `src/i18n/index.tsx` (the `useT()` hook + `TranslationKey`)
and `src/i18n/locales/{en,pt,es,de,fr}.json` — English is the source of
truth (`TranslationKey = keyof typeof en`), the others translate the same
keys. "system" follows the OS/webview language; any other value pins one
language.

**Pack descriptions and credits are translated too.** The catalog stores
translation keys + variables rather than prose, so the same catalog reads
correctly in every UI language:

| Field | Keys |
|---|---|
| `descriptionKey`/`descriptionVars` | `packDesc.systemDefault`, `packDesc.bundledTheme`, `packDesc.plusTheme` |
| `audioCreditKey`/`audioCreditVars` | `credit.audio.*` (2) |
| `imageCreditKey`/`imageCreditVars` | `credit.image.*` (10) |

Render with `resolvePackDescription(pack, t)` and `resolvePackCredit(pack, t)`,
never `pack.description`/`pack.sourceCredit` directly — those are only the
fallback for packs with no key (custom packs, or a catalog published before
this change). `build-catalog.mjs` emits both the keys and the Portuguese
prose.

Credits carry attribution and trademark notices, so the key set is
deliberately fine-grained: an official Microsoft logo screen, a brand
graphic and packaging art each have their own key rather than sharing a
vague "official artwork" one. Adding a cover means picking the key that
actually describes the asset — don't reach for the closest existing one.

## Pack catalog

The `.wav` files don't live in the repo. They're in the **`sounddeck-packs`**
R2 bucket, and the app reads the base URL from `VITE_PACKS_BASE_URL` (the
committed `.env` only has this public URL — it's not a secret; `VITE_`
variables ship in the client bundle).

Authoring pipeline, run by hand and **outside the app**:

```
classic-scheme zips
  → scripts/build-catalog.mjs    # extracts, normalizes, generates catalog.json
  → scripts/upload-catalog.mjs   # uploads to R2 via wrangler
```

**None of this publishes on its own.** Changing `scripts/cover-images/`, the
`COVER_IMAGE_OVERRIDES`/`COVER_PHOTO_CREDITS` tables, or anything that
affects the catalog only takes effect after both commands above run —
whenever you touch something here, run both before considering the change
done. `build-catalog.mjs` only works with the local folder of original
`.zip` archives (`SOURCE_DIR`, currently `C:\Users\Lucas Diniz\Downloads\Nova pasta (2)`)
— if that folder doesn't exist in the current environment, **the full
pipeline can't run**, since it reprocesses the audio too.

Bucket layout, for anyone who needs to touch it directly:
`catalog.json` at the root; each pack under `packs/<id>/`, with the `.wav`
files and (if present) a `cover.jpg` inside. `packService`/`remoteCatalogService.ts`
resolve everything from those two conventions — no per-pack special-casing.

If only a pack's **cover** changes (not the audio) and the local folder
isn't available, there's an equivalent shortcut without running the full
pipeline: download the published `catalog.json`, set `cover.imageUrl = "cover.jpg"`
and update `sourceCredit` only for the affected packs (same format
`build-catalog.mjs` would generate), upload the `cover.jpg`(s) to
`packs/<id>/cover.jpg` and the updated `catalog.json` via
`wrangler r2 object put ... --remote`. This is a shortcut, not the normal
path — it only covers cover/metadata, never swapping audio, and only
because the end result is identical to what the full pipeline would produce
(the override tables in `build-catalog.mjs` already get updated either way,
so running the full pipeline afterward doesn't undo anything). The same
isolation logic (diff packs before/after, make sure only the intended one
changed) applies to **adding** a whole new pack outside the pipeline — that's
how `win7` and `vista` (see below) were published.

The public bucket doesn't send `Cache-Control` on `catalog.json` or the
`.wav`/`.jpg` files — browsers apply heuristic caching based on
`Last-Modified`. After publishing something new, a `curl` always shows
fresh data; an already-open browser tab can keep showing the old version
until the cache expires or a forced reload (`cache: 'no-store'`) happens.
Not a bug — that's just how the bucket was already configured.

On audio licensing: the classic schemes come from public fan archives
(`lelegofrog.github.io`). The site is explicit that audio files are not
redistributed by Microsoft (`packs.note` on the site) — that remains true,
keep that line. Two packs deviate from that source: `win7` and `vista`
(plain, theme-less schemes — something `lelegofrog` didn't have) come from
archive.org items that preserve the `Media` folder of real Windows 7 and
Vista installs. Published as a one-off exception straight to R2, outside
the normal pipeline — see the note in `scripts/build-catalog.mjs` about the
risk of a full rerun silently overwriting `catalog.json` and dropping both.

On covers, the **default** rule is: free-licensed or original images only,
never a trademarked logo or wallpaper — that's what `scripts/build-catalog.mjs`
does for the Plus! packs (95 and XP) and the named Vista themes
(Glass/Pearl/Tinker), 11 in total. There is a **deliberate exception**, by
the author's explicit decision, that today covers the whole Windows
7/8/10/98/XP/Vista set (18 packs): `xp-real`, `win10`, `win98`, `win8`,
`win7-delta` and `vista` use Microsoft's official logo/splash art directly;
every other `win7-*` — including `win7-heritage`, the author's own personal
photo — has the Windows 7 logo composited on top. All of this is documented
in `COVER_PHOTO_CREDITS` in the script itself, without hiding that it's
Microsoft material. Don't generalize this exception to the named Vista
themes, to Plus!, or to new packs without confirming again — there's no
logo asset for those sub-brands today.

## Custom pack (local-only)

`src/features/custom-pack/` lets the user create their own pack: a name +
a `.wav` per event via the same native dialog as the Editor. Saved to
`localStorage` (`customPackService.ts`) — **no upload, no new Tauri
command**. `packService.listPacks()` merges these local packs with the
remote/mock catalog. Preview falls back to the synthesized tone like any
pack without a `remoteBaseUrl` (the app has no filesystem permission to
play an arbitrary local `.wav` — see `tonePreview.ts`).

An assignment keeps **both** `fileName` (for display) and `filePath` (the
absolute path the native dialog returned). `filePath` is what makes a custom
pack appliable at all — the file is never copied into the app, so losing the
path would leave a pack that looks fine in the library and cannot be
applied. Catalog packs have no `filePath` and resolve their audio by
downloading at apply time instead.

## Onboarding and update check

`src/features/onboarding/` covers three launch-time behaviours, all keyed off
`localStorage`:

- **First run** — `useFirstRun` shows a 4-step tour when no version marker
  exists. The decision is made **once, at module load**, not in an effect:
  making it writes the marker, so a second invocation (StrictMode, or any
  remount) would read back what the first wrote and conclude there's nothing
  to show.
- **After an upgrade** — the same hook shows "what's new" when the marker is
  older than the running build.
- **Update available** — `useUpdateCheck` compares the running version
  against the newest GitHub release and shows a header link when it's behind.

Release notes are **not** duplicated in the app. Both the dialog and the
landing page read the GitHub release body, so the notes are written once,
when publishing the release. They're English-only for that reason, even
though the rest of the UI is translated. `releaseService.ts` caches the API
response for 6h — GitHub rate-limits unauthenticated calls.

## Site (`site/`)

The Chimer site: Vite + React + Tailwind, **prerendered to static HTML** — one
file per language per page. It replaced the old static generator, which has been removed.

```bash
npm run dev --prefix site          # local, port 5173
npm run build --prefix site        # client -> SSR -> prerender, into site/dist
npm run build:packs --prefix site  # refresh the catalog data
cd site && npx wrangler deploy     # publishes; see the warning below
```

`npm run build` is three passes: a normal client build, an SSR build of
`src/entry-server.tsx`, then `scripts/prerender.mjs`, which renders every
(language, page) pair with `renderToString` and writes it into the client's
`index.html` shell. The client hydrates that markup instead of replacing it.

**Why prerendered and not a plain SPA.** The site must serve translated HTML at
a real URL per language. A JavaScript switcher got only the default language
indexed once already; rendering the content client-side would repeat that,
because the served file would be an empty `<div id="root">`. If you change the
routing or the entry points, verify the built HTML still contains the copy —
`grep` the headline out of `dist/pt/index.html`.

- **Languages:** English at the root, the rest under `/pt/`, `/es/`, `/de/`,
  `/fr/`. Add one by dropping a `src/i18n/<code>.json` with the same keys and
  adding the code to `LANGS` in `src/i18n.ts`.
- **Strings** live in `site/src/i18n/*.json`. English is the source of truth —
  `TranslationKey` derives from it, so an unknown key is a type error. The
  privacy, download, changelog and 404 copy was reused verbatim from
  the old static generator before it was removed; don't re-author it.
- **Pack data** is generated into `src/packs.generated.ts` at build time from
  the published catalog, never fetched at runtime: the pack list belongs in the
  served HTML, and the bucket sends no `Cache-Control`. Re-run `build:packs`
  after publishing catalog changes.
- **Release data** (download links, changelog) is fetched client-side, because
  it changes without a rebuild. Nothing about a version or filename is
  hardcoded — a stale link 404s silently.
- `prerender.mjs` also emits `sitemap.xml`, `robots.txt` and a root `404.html`,
  plus the per-page `<title>`, description, canonical, hreflang, Open Graph and
  Twitter tags, and a `SoftwareApplication` JSON-LD block on each language's
  home page. **Social tags belong there, not in `index.html`** — hardcoding
  them shipped the English home page's card on all 25 pages, with an `og:image`
  relative URL that no crawler resolves.
- **`public/img/` and `dist/assets/` are separate on purpose.** `assets/` holds
  only Vite's content-hashed output, so `public/_headers` can mark it
  `immutable` for a year without ever pinning stale bytes; hand-authored images
  live under `img/` with stable names and a one-week TTL. Putting an
  unhashed file back into `assets/` would make it uncacheable-forever by
  mistake.
- The hero screenshot ships as AVIF/WebP/PNG through a `<picture>`; the PNG is
  a fallback modern browsers never fetch. Keep the `width`/`height` on the
  `<img>` — it is the LCP element and they are what reserve its box.

`wrangler deploy` publishes straight to the live domain — there is no staging
environment, so build and check `dist/` first.

## Release

Pushing a `v*.*.*` tag triggers [.github/workflows/release.yml](.github/workflows/release.yml):
GitHub Actions builds on `windows-latest` via `tauri-action` and creates a
**draft** release — you need to publish it by hand on GitHub.

The version lives in **three places** and they must match:
`package.json`, `src-tauri/Cargo.toml`, `src-tauri/tauri.conf.json`.
`src-tauri/Cargo.lock` carries it too and won't update itself — patch its
`[[package]] name = "chimer"` entry, or the next build silently rewrites
the lockfile.

**Write the release notes before publishing the draft.** The workflow only
fills in a placeholder. Those notes are the changelog: the landing page and
the app's "what's new" dialog both render the release body, one bullet per
line, straight from the GitHub API. Plain lines only — a `##` heading would
render as a literal bullet.

After publishing, the site's download and changelog pages pull the release
from the GitHub API at runtime — nothing to rebuild or redeploy.

### winget

Manifests under `winget/<version>/`, identifier `LucasHenriqueDiniz.SoundDeck`.
Only the **current** release's folder is kept — winget doesn't need every
past version tracked, just the one that should install today. For every new
release: delete the previous version's folder, copy the manifest as a new
`winget/<version>/`, update the version, URLs, `ReleaseDate` and the
installers' **SHA256**, validate, and open a PR against
`microsoft/winget-pkgs` — closing the previous version's PR first if it's
still open (one active submission at a time, not one per release).

```bash
winget validate --manifest winget/<version>
```

## Conventions

- **Commits in English**, imperative, explaining why and not just what.
- **Docs prose is in English too** (`README.md`, `DESIGN.md`, this file) —
  code comments are also English. Keep both English; there's no PT/EN split
  anymore.
- Comments explain **why**, not what. The comments in `windows_sound.rs` are
  the standard to follow.
- Default branch: `master`.

## Current state

Active development.

The app UI **has real i18n** (5 languages — see "App i18n" above).

The MSI's `UpgradeCode` is **pinned** in `tauri.conf.json`
(`bundle.windows.wix.upgradeCode`). Don't change this GUID: it's what makes
Windows recognize a new version as an upgrade of the previous one instead of
installing both side by side. It was read from the already-distributed
0.1.0 MSI.
