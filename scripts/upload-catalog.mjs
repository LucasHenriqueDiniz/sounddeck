#!/usr/bin/env node
/**
 * Uploads the staged output of build-catalog.mjs to the real R2 bucket via
 * `wrangler r2 object put`, run with modest concurrency (npx/wrangler
 * process startup dominates the cost of 400 individual invocations, so
 * batching a few in parallel matters more than any single upload's speed).
 *
 * One-off authoring tool — not part of the shipped app.
 *
 * Usage: node scripts/upload-catalog.mjs [stagingDir] [bucketName]
 */
import { spawn } from "node:child_process";
import { readdirSync, statSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, relative } from "node:path";

const STAGING_DIR = process.argv[2] ?? join(tmpdir(), "sounddeck-catalog");
const BUCKET = process.argv[3] ?? "sounddeck-packs";
const CONCURRENCY = 8;

function walk(dir) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) out.push(...walk(full));
    else out.push(full);
  }
  return out;
}

function contentTypeFor(path) {
  if (path.endsWith(".json")) return "application/json";
  if (path.toLowerCase().endsWith(".wav")) return "audio/wav";
  return "application/octet-stream";
}

// spawn(..., { shell: true }) on Windows joins args into a single command
// line and does NOT quote array elements for you — paths with spaces (every
// real filename here) get split into extra, wrong arguments unless each one
// is explicitly quoted here.
const q = (s) => `"${String(s).replace(/"/g, '\\"')}"`;

function uploadOne(filePath) {
  return new Promise((resolve) => {
    const key = relative(STAGING_DIR, filePath).replace(/\\/g, "/");
    const objectPath = `${BUCKET}/${key}`;
    const command = [
      "npx",
      "wrangler",
      "r2",
      "object",
      "put",
      q(objectPath),
      "--file",
      q(filePath),
      "--content-type",
      q(contentTypeFor(filePath)),
      "--remote",
    ].join(" ");

    const child = spawn(command, { shell: true, stdio: ["ignore", "ignore", "pipe"] });
    let stderr = "";
    child.stderr.on("data", (d) => (stderr += d.toString()));
    child.on("exit", (code) => resolve({ key, ok: code === 0, code, stderr: stderr.trim() }));
    child.on("error", (err) => resolve({ key, ok: false, code: -1, stderr: String(err) }));
  });
}

async function main() {
  const files = walk(STAGING_DIR);
  console.log(`Uploading ${files.length} files from ${STAGING_DIR} to bucket "${BUCKET}"…`);

  let done = 0;
  let failed = 0;
  const queue = [...files];

  async function worker() {
    while (queue.length > 0) {
      const filePath = queue.shift();
      const result = await uploadOne(filePath);
      done += 1;
      if (!result.ok) {
        failed += 1;
        console.error(`FAILED: ${result.key} (exit ${result.code})${result.stderr ? `\n  ${result.stderr.slice(0, 300)}` : ""}`);
      }
      if (done % 25 === 0 || done === files.length) {
        console.log(`  ${done}/${files.length}`);
      }
    }
  }

  await Promise.all(Array.from({ length: CONCURRENCY }, worker));
  console.log(`\nDone. ${files.length - failed}/${files.length} uploaded successfully.`);
  if (failed > 0) process.exitCode = 1;
}

main();
