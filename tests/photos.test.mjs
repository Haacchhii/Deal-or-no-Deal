import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, mkdir, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import sharp from "sharp";

const run = promisify(execFile);
const script = fileURLToPath(
  new URL("../scripts/prepare-photos.mjs", import.meta.url),
);

test("photo preparation preserves source and aspect ratio, creates thumbnails, and refuses overwrite", async () => {
  const workspace = await mkdtemp(path.join(tmpdir(), "unit-page-photo-test-"));
  const originals = path.join(workspace, "originals");
  await mkdir(originals);
  const source = path.join(originals, "Living Room.png");
  await sharp({
    create: { width: 1200, height: 1800, channels: 3, background: "#183c34" },
  })
    .png()
    .toFile(source);
  const before = await readFile(source);
  await run(process.execPath, [script, "2103B", originals], { cwd: workspace });
  const full = path.join(workspace, "public/units/2103B/living-room.webp");
  const thumb = path.join(
    workspace,
    "public/units/2103B/living-room-thumb.webp",
  );
  const fullMetadata = await sharp(full).metadata();
  const thumbMetadata = await sharp(thumb).metadata();
  assert.equal(fullMetadata.width, 1200);
  assert.equal(fullMetadata.height, 1800);
  assert.equal(thumbMetadata.width, 640);
  assert.equal(thumbMetadata.height, 960);
  assert.deepEqual(await readFile(source), before);
  const outputBefore = await readFile(full);
  await assert.rejects(
    run(process.execPath, [script, "2103B", originals], { cwd: workspace }),
    /Already exists/,
  );
  assert.deepEqual(await readFile(full), outputBefore);
});

test("photo preparation rejects original/thumbnail name collisions before writing", async () => {
  const workspace = await mkdtemp(path.join(tmpdir(), "unit-page-photo-test-"));
  const originals = path.join(workspace, "originals");
  await mkdir(originals);
  for (const name of ["room.png", "room-thumb.png"]) {
    await sharp({
      create: { width: 10, height: 10, channels: 3, background: "#183c34" },
    })
      .png()
      .toFile(path.join(originals, name));
  }
  await assert.rejects(
    run(process.execPath, [script, "2103B", originals], { cwd: workspace }),
    /collides with a generated thumbnail/,
  );
});
