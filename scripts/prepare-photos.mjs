import { mkdir, readdir, access } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { parseUnit } from "../src/catalog.js";

const [unitId, sourceFolder, realUnitNumber = unitId] = process.argv.slice(2);
if (!unitId || !sourceFolder)
  throw new Error('Usage: npm run photos -- 2103B "C:/path/to/originals"');
parseUnit(realUnitNumber);
const destination = path.resolve("public", "units", unitId);
const sources = (await readdir(sourceFolder)).filter((name) =>
  /\.(jpe?g|png|webp)$/i.test(name),
);
if (!sources.length) throw new Error("No JPG, PNG or WebP photos found.");
const jobs = sources.map((name) => ({
  source: path.resolve(sourceFolder, name),
  slug: path
    .parse(name)
    .name.toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, ""),
}));
if (
  jobs.some((job) => !job.slug) ||
  new Set(jobs.map((job) => job.slug)).size !== jobs.length
)
  throw new Error(
    "Photo names are empty or collide after normalization. Rename them first.",
  );
const outputNames = jobs.flatMap((job) => [
  `${job.slug}.webp`,
  `${job.slug}-thumb.webp`,
]);
if (new Set(outputNames).size !== outputNames.length)
  throw new Error(
    "A photo name collides with a generated thumbnail. Rename source files ending in -thumb.",
  );
for (const job of jobs) {
  for (const suffix of ["", "-thumb"]) {
    const target = path.join(destination, `${job.slug}${suffix}.webp`);
    try {
      await access(target);
    } catch (error) {
      if (error.code === "ENOENT") continue;
      throw error;
    }
    throw new Error(
      `Already exists: ${target}. Use a new filename to preserve the current photo.`,
    );
  }
}
await mkdir(destination, { recursive: true });
for (const { source, slug } of jobs) {
  await sharp(source)
    .rotate()
    .resize({ width: 1800, withoutEnlargement: true })
    .webp({ quality: 82 })
    .toFile(path.join(destination, `${slug}.webp`));
  await sharp(source)
    .rotate()
    .resize({ width: 640, withoutEnlargement: true })
    .webp({ quality: 75 })
    .toFile(path.join(destination, `${slug}-thumb.webp`));
  console.log(
    `Prepared ${unitId}/${slug}. Add this filename, caption and alt text to src/catalog.json.`,
  );
}
