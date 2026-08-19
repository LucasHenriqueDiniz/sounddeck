# Chimer — Design System

A Windows app (Tauri + Rust) that swaps the system sound scheme. The identity
is nostalgia (XP/Vista/7) presented through a clean, modern UI.

Every value here exists as a token in [src/styles/tokens.css](src/styles/tokens.css).
Components reference tokens and never hardcode a colour, size or radius —
that is what makes a palette change a one-file edit rather than a sweep.
If you need a value that isn't here, add a token; don't inline a literal.

---

## 1. Colour

| Name | Use | Hex |
|---|---|---|
| Brand primary | Brand mark, gradient | `#D4537E` |
| Accent | Primary actions, selected state | `#BF436D` |
| Brand accent | Gradient partner, warm details | `#F0997B` |
| Dark | Dark-mode surfaces, text on light | `#1A1A1A` |
| Light neutral | Canvas, cards | `#F1EFE8` |
| Success | Confirmation (backup ok, applied) | `#4F7D18` |
| Warning | Soft alerts | `#9A6410` |
| Error | Failures, destructive actions | `#C93B3A` |

**Brand gradient** (icon, accents): `linear-gradient(135deg, #F0997B, #D4537E)`

**Dark mode:** surfaces `#1A1A1A` / `#242424`, primary text in off-white
(`#F1EFE8`), accents kept vivid rather than desaturated.

### Why `--accent` isn't the brand pink

`#D4537E` with white text measures **3.93:1**. WCAG AA wants 4.5:1 at 16px, so
that combination fails as a button. `--accent` is `#BF436D` instead — the same
pink to the eye, **4.95:1** with white.

The exact brand pink lives on as `--brand-primary`, used where nothing sits on
top of it: the gradient, the app icon, the focus ring.

Dark mode has the mirror problem. The accent is lightened for a dark canvas,
which makes *white* text worse (3.19:1), so dark mode puts **dark text on the
light accent** (`--text-on-accent: #1A1A1A`, 5.46:1).

Semantic colours are darker in light mode and lighter in dark mode for the
same reason — the mid-tone versions in the brief only pass on one of the two.

**Any new colour pair carrying text must clear 4.5:1** (3:1 for large text and
non-text indicators). Check before committing; the palette has no slack left in
the accent range.

---

## 2. Typography

**Segoe UI Variable** (native to Windows 11), falling back to Inter and the
system stack. Only weights **400 and 500** — no semibold, no bold. Hierarchy
comes from size and colour.

| Style | Size | Weight | Token | Use |
|---|---|---|---|---|
| H1 | 28px | 500 | `--text-2xl` | Screen title |
| H2 | 20px | 500 | `--text-xl` | Sections |
| H3 | 16px | 500 | `--text-lg` | Subtitles, card titles |
| Body | 16px | 400 | `--text-md` | Default text |
| — | 14px | 400 | `--text-sm` | Dense metadata (see below) |
| Caption | 13px | 400 | `--text-xs` | Metadata, dates, hints |

`--text-sm` has no counterpart in the five styles above. It's a deliberate
addition for dense rows — chips, table cells, toolbars — that would otherwise
jump straight from 13px to 16px. Prefer a listed style; reach for it only when
a row genuinely can't carry body text.

---

## 3. Spacing and radius

- Base grid: **8px** (`--space-2`). The 4px step exists for optical nudges
  inside a control, not for layout.
- Card padding: `16px`
- Component radius (buttons, inputs): `8px` — `--radius-md`
- Card radius: `12px` — `--radius-lg`
- App icon radius: superellipse, ~22% of the canvas

Borders are **1px**, not the 0.5px in the original brief: sub-pixel borders
render inconsistently at 100% display scale on Windows, disappearing on some
machines and doubling on others.

---

## 4. Components

### Sound pack card
Background `--surface-panel`, border `1px solid --border-subtle`, radius
`--radius-lg`, padding `--space-4`. Cover → name (H3) → metadata (caption) →
action button.

### Buttons
- **Primary**: `--accent` background, `--text-on-accent` label, radius `--radius-md`
- **Secondary**: transparent, `1px solid --border-default`
- **Ghost**: transparent, no border, hover fills with `--surface-hover`

### Event row (editor)
Event name left, play button and file name right. Border
`1px solid --border-subtle`, radius `--radius-md`.

### App icon
Superellipse, brand gradient background, white bell with radiating sound
waves. Built by [scripts/build-icon.mjs](scripts/build-icon.mjs) from
`scripts/icon-source-artwork.png` — it derives the alpha from the artwork's
luminance and un-premultiplies the edge (the source is composited on black, so
skipping that leaves a dark fringe on light backgrounds). Regenerate the
platform sizes with `npm run tauri icon src-tauri/icons/source.png`, then
delete the `android/` and `ios/` folders it emits; this app is Windows-only.

---

## 5. Motion

`--motion-fast` (120ms) for hovers, `--motion-base` (180ms) for state changes,
`--motion-slow` (260ms) for anything entering or leaving. Easing is
`--ease-standard` everywhere. Respect `prefers-reduced-motion`.
