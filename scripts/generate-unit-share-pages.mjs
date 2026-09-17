import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const catalog = JSON.parse(
  await readFile(new URL("../src/catalog.json", import.meta.url), "utf8"),
);
const output = path.resolve(process.argv[2] || "dist");
const publicRoot = "https://haacchhii.github.io/Unit-Page/";
const escape = (value) =>
  String(value).replace(
    /[&<>"']/g,
    (character) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        character
      ],
  );
const displayName = (unit) => unit.displayName || unit.unitNumber || unit.id;
const rentalTypes = (unit) =>
  unit.rentalTypes || (unit.rentalType ? [unit.rentalType] : []);

for (const unit of catalog.units) {
  const detail = [...rentalTypes(unit), unit.spaceLabel].filter(Boolean).join(" · ");
  const albumName = [displayName(unit), detail].filter(Boolean).join(" · ");
  const title = `Unit ${albumName} | ${catalog.name}`;
  const description = `View photographs for Unit ${albumName} at ${catalog.building}.`;
  const pageUrl = `${publicRoot}units/${unit.id}/`;
  const first = unit.photos[0];
  const imageFolder = first.placeholder ? "_placeholders" : unit.id;
  const category = !first.placeholder && first.folder ? `${first.folder}/` : "";
  const imageUrl = `${publicRoot}units/${imageFolder}/${category}${first.file}.webp`;
  const redirect = `../../#/units/${unit.id}`;
  const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="description" content="${escape(description)}">
    <meta property="og:type" content="website">
    <meta property="og:title" content="${escape(title)}">
    <meta property="og:description" content="${escape(description)}">
    <meta property="og:image" content="${escape(imageUrl)}">
    <meta property="og:url" content="${escape(pageUrl)}">
    <link rel="canonical" href="${escape(pageUrl)}">
    <meta http-equiv="refresh" content="0;url=${escape(redirect)}">
    <title>${escape(title)}</title>
    <script>location.replace(${JSON.stringify(redirect)});</script>
  </head>
  <body>
    <p>Opening <a href="${escape(redirect)}">Unit ${escape(albumName)}</a>…</p>
  </body>
</html>`;
  const directory = path.join(output, "units", unit.id);
  await mkdir(directory, { recursive: true });
  await writeFile(path.join(directory, "index.html"), html);
}

console.log(`Generated ${catalog.units.length} unit share pages.`);
