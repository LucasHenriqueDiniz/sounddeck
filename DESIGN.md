# SoundDeck — design contract

## Product character

Precise, calm, trustworthy, quietly nostalgic, never excessive. SoundDeck is
a system utility — not a marketing site or an admin dashboard. Nostalgia
comes through in the pack covers, names and previews; the interface itself
stays neutral and quiet, letting the content (covers, waveforms, event
names) carry the color and personality.

## Interaction density

Compact/comfortable density (not spacious). The event list and the pack
library prioritize showing more useful items per screen. Dialogs and result
screens (success/error) can breathe more, since they appear rarely.

## Typography

- **UI:** `"Segoe UI Variable Text", "Segoe UI", -apple-system, "Inter", system-ui, sans-serif`
  (native on Windows 11/10, no network dependency).
- **Display:** same family as UI, just heavier weight — no second decorative
  font.
- **Monospace:** `"Cascadia Code", "Consolas", ui-monospace, monospace` —
  used only for file names and technical identifiers.
- **Scale:** `--text-xs` (11px) to `--text-2xl` (24px), 6 steps. See `tokens.css`.
- **Weights:** 400 (body), 500 (labels/emphasis), 600 (section titles).
- **Numbers:** duration, counts and percentages use `font-variant-numeric: tabular-nums`.
- Never use uppercase for long labels; small text never goes below `--text-xs`.

## Semantic colors

Tokens live in `src/styles/tokens.css`, with light and dark defined
intentionally (not an automatic inversion). Usage:

| Token | Role |
|---|---|
| `--surface-canvas` | window background |
| `--surface-panel` | panels (library, editor, lists) |
| `--surface-raised` | cards, selectable rows |
| `--surface-overlay` | dialogs, menus |
| `--surface-selected` / `--surface-hover` | selection and hover states |
| `--text-primary/secondary/muted` | typographic hierarchy |
| `--text-on-accent` | text over `--accent` |
| `--border-subtle/default/strong` | dividers, outlines |
| `--accent` / `--accent-hover` / `--accent-active` / `--accent-soft` | the single accent color (amber/brass) — primary actions, selection, progress |
| `--success` / `--warning` / `--danger` / `--info` | system states — always paired with icon/text, never color alone |
| `--focus-ring` | focus ring — a blue tone, deliberately distinct from the accent, so "selected" is never confused with "focused" |

## Surfaces and borders

Three levels: `canvas` (background), `panel` (structural container, no
shadow), `raised` (an individual item inside a panel — 1px border, no
shadow). Shadow (`--shadow-raised`, `--shadow-overlay`) is reserved for
elements that float above content: dialogs, menus, tooltips. Never use
shadow on cards inside lists — hierarchy comes from border + spacing.

Dividers use `--border-subtle` within a group and `--border-default` between
sections.

## Geometry

- Spacing: `--space-1` (4px) to `--space-12` (48px), 4/8px scale.
- Radii: `--radius-sm` (4px, small controls), `--radius-md` (8px, cards/inputs/buttons),
  `--radius-lg` (12px, dialogs). Never more than three levels.
- Control heights: `--control-sm` (28px), `--control-md` (34px), `--control-lg` (40px).
- Max width for reading content (summaries, dialogs): `--content-max`.

## Elevation

Only two shadow levels: `--shadow-raised` (light dropdown) and
`--shadow-overlay` (modal dialog). Nothing beyond that.

## Motion

- `--motion-fast` (120ms) for hover/pressed/focus.
- `--motion-base` (180ms) for opening/closing panels, switching tabs.
- `--motion-slow` (260ms) for progress transitions and success confirmation.
- Default easing: `--ease-standard`.
- `prefers-reduced-motion: reduce` removes essentially all
  transition/animation duration globally — implemented in `base.css`.

## Components

- **Buttons:** primary (`--accent`), secondary (neutral outline), ghost
  (no outline), danger (`--danger`). Always with a loading state (spinner
  replaces the icon slot, text stays) and disabled state (opacity +
  `cursor: not-allowed`, never opacity alone without `aria-disabled`).
- **Badges/status:** always icon + text, never background color alone.
- **Lists:** rows with `--border-subtle` dividers, no card per item.
- **Cards:** reserved for discrete objects with a cover (packs). Never a
  card inside a card.
- **Dialogs:** title, body with `--content-max`, actions right-aligned,
  `Esc` closes, initial focus on the first relevant control, focus returns
  to the trigger on close.
- **Status banner:** persistent/contextual at the top of the content area,
  `status`/`alert` role depending on severity.
- **Empty/error states:** short title, one-line explanation, next action
  when one exists.

## Window behavior

- Minimum size: **1040×680** (set in `tauri.conf.json`).
- Dual-pane layout (list + detail) only above ~880px of usable width; below
  that, the detail pane replaces the list with a "back" button (never a
  stacked mobile layout).
- No horizontal scrolling on any screen — wide lists use ellipsis/middle
  truncation for file paths.
- Custom title bar (`decorations: false`): the 52px top bar is the only
  draggable region (`data-tauri-drag-region="deep"`, which automatically
  excludes tabs, buttons and inputs — no interactive control sits inside the
  drag region). Minimize/maximize/close buttons (`app/WindowControls.tsx`)
  replace the native controls, follow the Windows 11 visual convention
  (46px wide, full bar height, red hover on close) and sit flush against
  the window's right edge. Double-clicking the drag region
  maximizes/restores (native Tauri behavior, no extra code).
- Shortcuts: `Esc` closes dialogs/menus; `Enter`/`Space` activate focused
  controls; arrow keys navigate event lists and tabs.

## Accessibility

- Minimum AA contrast (4.5:1 for normal text, 3:1 for large text/informative
  icons) in both themes.
- Focus always visible (`:focus-visible`, never suppressed).
- Minimum touch/click target of 28px on dense controls.
- Every icon-only action has an `aria-label` and tooltip.
- State is never communicated by color alone (text/icon always accompanies it).
- Async status regions use `aria-live="polite"` (or `assertive` for errors).
