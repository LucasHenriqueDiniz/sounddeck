# Chimer

Windows 10/11 sound scheme manager. Pick a pack, preview it, apply it —
no need to touch Control Panel — with an automatic backup of the current
scheme before any change.

Built with Tauri 2, React 19 and TypeScript.

**[sounddeck.lucashdo.com](https://sounddeck.lucashdo.com)** · [Download](https://sounddeck.lucashdo.com/download) · [Changelog](https://sounddeck.lucashdo.com/changelog)

## What it does

- **Sound packs** — browse a catalog of sound schemes and apply one with a click.
- **Preview before applying** — listen to each event (startup, recycle bin, error, notification) before committing.
- **Backup and restore** — the current scheme is saved before every apply; go back to it whenever you want.
- **Per-event editing** — swap individual sounds instead of the whole pack.
- **Custom packs** — build your own pack locally (name it, pick a `.wav` per event); nothing is uploaded.
- **100% local** — files live on your machine; no account, no telemetry, no upload.

Thirty packs are available from the catalog: the Windows 98, XP, Vista, 7, 8
and 10 default schemes, the thirteen Windows 7 bonus themes, the Vista
Glass/Pearl/Tinker themes, and the Microsoft Plus! packs for Windows 95 and XP
— all real audio from the original schemes.

## Installation

Requires Windows 10 version 1809 or later, or Windows 11. No administrator
privileges needed, no extra runtime: the app uses the WebView2 already
present on the system.

Download the installer from the [releases page](https://github.com/LucasHenriqueDiniz/chimer/releases/latest).

A winget package is [submitted but not yet merged](https://github.com/microsoft/winget-pkgs/pull/420722). Once it lands:

```bash
winget install LucasHenriqueDiniz.Chimer
```

## How it works

The app writes directly to the Windows registry's sound-scheme keys
(`src-tauri/src/windows_sound.rs`), under `HKCU\AppEvents\Schemes\Apps`, and
keeps the `.wav` files in a per-pack managed folder. The backup
(`src/features/backups`) serializes the current scheme before any write, so
applying a pack is always reversible.

No system file is modified, no DLL is replaced, and nothing is written
outside the user's own registry hive — the same place the official Control
Panel uses.

## Development

```bash
npm install
npm run tauri dev
```

Production build:

```bash
npm run tauri build
```

See [AGENTS.md](AGENTS.md) for the detailed architecture and [DESIGN.md](DESIGN.md)
for the design contract. (`CLAUDE.md` exists only as a one-line import, so
Claude Code reads the same file too.)

## Structure

```txt
src/
  features/
    packs/         # pack catalog and installation
    apply-pack/    # apply-to-system flow
    sound-events/  # individual Windows events
    backups/       # scheme backup and restore
    custom-pack/   # local-only custom pack creation
  services/tauri/  # bridge to the Rust backend
src-tauri/src/
  windows_sound.rs # sound registry read/write
  pack_download.rs # pack download and extraction
site/              # the website: React, prerendered per language (Cloudflare)
winget/            # per-version winget manifests
scripts/
  build-catalog.mjs # catalog authoring tool (not shipped in the app)
```

## Credits

Classic scheme audio files come from public fan archives, such as
[lelegofrog.github.io/wav.html](https://lelegofrog.github.io/wav.html), plus
a couple of items on [archive.org](https://archive.org) preserving real
Windows installs (see [AGENTS.md](AGENTS.md) for details). Chimer is not
affiliated with Microsoft. Windows is a trademark of Microsoft.

## License

[MIT](LICENSE).

## Status

v0.4.0 published. Active development.

The app is called Chimer as of v0.4.0; it shipped as SoundDeck up to v0.3.1.
The domain, the bundle identifier and the localStorage keys deliberately still
carry the old name — see AGENTS.md for why.
