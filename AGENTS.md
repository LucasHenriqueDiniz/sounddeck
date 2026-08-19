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
npm run build:landing-packs  # regenerates landing-page/packs-data.js
npm run build:og             # regenerates landing-page/og.png
npm run build:landing        # generates landing-page/dist/ (multilingual site)
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
language. Pack description/credit (`SoundPack.description`/`sourceCredit`)
**do not** go through this system — they're literal strings defined in the
catalog, not translation keys.

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

## Landing page

A **multilingual** static site, generated by a script. Published at
**https://sounddeck.lucashdo.com** (Cloudflare Workers).

```
landing-page/
  templates/   source HTML, with data-i18n and {{LANG}} {{BASE}} <!--HEAD--> <!--LANGS--> markers
  i18n/        en.json pt.json es.json de.json fr.json  — single source of the strings
  static/      site.css site.js og.png favicon.png icon-310.png packs-data.js llms.txt
  dist/        generated, outside git — this is what wrangler publishes
```

```bash
npm run build:landing      # generates dist/
cd landing-page && npx wrangler deploy
```

**Never edit `dist/` or the per-language HTML** — they're output. Edit
`templates/` (structure) or `i18n/*.json` (text).

Each language has its own URL: English at the root, the others under
`/pt/`, `/es/`, `/de/`, `/fr/`. This isn't a style preference — a
JavaScript-based language switcher makes Google index only the default
language, which was the problem before. The translated text needs to be in
the served HTML.

To add a language: create `i18n/<code>.json` with the same keys and add an
entry to `LANGS` in the build. The build warns on stderr if any key is
missing.

Other conventions:

- English is the default and goes to the root. It's the first item in `LANGS`.
- The switcher uses **language names, never flags** — a flag is a country,
  not a language (pt = Brazil or Portugal? en = US or UK?).
- `site.js` doesn't translate anything. The few strings it uses at runtime
  (download and changelog, rendered from the GitHub API) come from
  `window.__I18N`, injected by the build.
- `og.png` is generated by a script: `npm run build:og`.
- `llms.txt` describes the site for AI agents. Update it when the product changes.

## Release

Pushing a `v*.*.*` tag triggers [.github/workflows/release.yml](.github/workflows/release.yml):
GitHub Actions builds on `windows-latest` via `tauri-action` and creates a
**draft** release — you need to publish it by hand on GitHub.

The version lives in **three places** and they must match:
`package.json`, `src-tauri/Cargo.toml`, `src-tauri/tauri.conf.json`.

After publishing, `landing-page/download.html` and `changelog.html` pull the
release from the GitHub API at runtime — nothing to do on the site.

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
