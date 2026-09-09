import { readFile, access } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { validateCatalog, photoPath } from "../src/catalog.js";

const catalog = JSON.parse(
  await readFile(new URL("../src/catalog.json", import.meta.url), "utf8"),
);
validateCatalog(catalog);
const paths = [
  catalog.hero.src,
  ...catalog.units.flatMap((unit) =>
    unit.photos.flatMap((photo) => [
      photoPath(unit, photo),
      photoPath(unit, photo, "thumb"),
    ]),
  ),
];
for (const path of paths) {
  if (path.includes("..") || path.startsWith("/") || path.includes("\\"))
    throw new Error(`Invalid asset path: ${path}`);
  await access(fileURLToPath(new URL(`../public/${path}`, import.meta.url)));
}
console.log(
  `Catalog valid: ${catalog.units.length} units, ${paths.length} image references verified.`,
);
