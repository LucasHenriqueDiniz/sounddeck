/**
 * Turns the flat artwork at repo root into the transparent master icon that
 * `tauri icon` expands into every platform size.
 *
 * The source is a squircle rendered on a black background with a drop shadow
 * baked in, no alpha channel. Two things follow from that:
 *
 * 1. The shape is a real superellipse, not a circular rounded rect, so masking
 *    it with a generated rounded rectangle either clips the corners or leaves
 *    a rim of shadow. The alpha is derived from the artwork's own luminance
 *    instead — safe here because the separation is enormous: the darkest pixel
 *    inside the shape is ~51, the brightest shadow pixel outside is ~1.
 *
 * 2. Compositing over black *is* premultiplication (rgb = artwork x alpha), so
 *    the partly transparent edge pixels are divided back out. Skipping that
 *    step leaves a dark fringe that's obvious against a light taskbar.
 */
import sharp from "sharp";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SOURCE = join(ROOT, "icon.png");
const OUT = join(ROOT, "src-tauri", "icons", "source.png");

// Luminance ramp that becomes the alpha channel. Comfortably above the shadow
// and far below the darkest pixel of the artwork.
const ALPHA_FLOOR = 8;
const ALPHA_CEIL = 30;

const MASTER = 1024;

const luminance = (r, g, b) => 0.2126 * r + 0.7152 * g + 0.0722 * b;

/** Tight bounds of the artwork, ignoring the shadow that fades into black. */
function findBounds(data, width, height, threshold = 60) {
  let x0 = width, y0 = height, x1 = -1, y1 = -1;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      if (luminance(data[i], data[i + 1], data[i + 2]) > threshold) {
        if (x < x0) x0 = x;
        if (x > x1) x1 = x;
        if (y < y0) y0 = y;
        if (y > y1) y1 = y;
      }
    }
  }
  if (x1 < 0) throw new Error("no artwork found above the threshold");
  return { left: x0, top: y0, width: x1 - x0 + 1, height: y1 - y0 + 1 };
}

const { data, info } = await sharp(SOURCE)
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });

const bounds = findBounds(data, info.width, info.height);
console.log(
  `source ${info.width}x${info.height} -> artwork at ` +
    `${bounds.left},${bounds.top} ${bounds.width}x${bounds.height}`
);

const out = Buffer.alloc(data.length);
let recovered = 0;
for (let i = 0; i < data.length; i += 4) {
  const r = data[i], g = data[i + 1], b = data[i + 2];
  const a = Math.min(1, Math.max(0, (luminance(r, g, b) - ALPHA_FLOOR) / (ALPHA_CEIL - ALPHA_FLOOR)));

  if (a <= 0) continue; // already zeroed by Buffer.alloc
  if (a < 1) recovered++;

  // Un-premultiply: the black background means rgb === artwork * a.
  out[i] = Math.min(255, Math.round(r / a));
  out[i + 1] = Math.min(255, Math.round(g / a));
  out[i + 2] = Math.min(255, Math.round(b / a));
  out[i + 3] = Math.round(a * 255);
}
console.log(`${recovered} edge pixels un-premultiplied`);

await sharp(out, { raw: { width: info.width, height: info.height, channels: 4 } })
  .extract(bounds)
  // The artwork is a hair off square (~1%); filling avoids shaving the corners.
  .resize(MASTER, MASTER, { fit: "fill", kernel: "lanczos3" })
  .png({ compressionLevel: 9 })
  .toFile(OUT);

const meta = await sharp(OUT).metadata();
console.log(`wrote ${OUT} — ${meta.width}x${meta.height}, alpha: ${meta.hasAlpha}`);
