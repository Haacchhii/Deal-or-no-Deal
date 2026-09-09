export function parseUnit(id) {
  const match = /^(\d{1,2})(\d{2})([AB])$/.exec(id);
  if (!match || Number(match[1]) < 1 || Number(match[2]) < 1)
    throw new Error(`Invalid unit number: ${id}`);
  return { id, floor: Number(match[1]), number: match[2], tower: match[3] };
}

export function ordinal(value) {
  const lastTwo = value % 100;
  const suffix =
    lastTwo >= 11 && lastTwo <= 13
      ? "th"
      : { 1: "st", 2: "nd", 3: "rd" }[value % 10] || "th";
  return `${value}${suffix}`;
}

export function groupUnits(units, tower) {
  const groups = new Map();
  units
    .map((unit) => ({ ...unit, ...parseUnit(unit.id) }))
    .filter((unit) => unit.tower === tower)
    .sort((a, b) => b.floor - a.floor || Number(a.number) - Number(b.number))
    .forEach((unit) =>
      groups.set(unit.floor, [...(groups.get(unit.floor) || []), unit]),
    );
  return [...groups].map(([floor, items]) => ({ floor, units: items }));
}

export function photoPath(unit, photo, size = "full") {
  return `units/${unit.id}/${photo.file}${size === "thumb" ? "-thumb" : ""}.webp`;
}

export function validateCatalog(catalog) {
  const seen = new Set();
  if (!catalog.name || !Array.isArray(catalog.units))
    throw new Error("Catalog requires a name and units array.");
  for (const unit of catalog.units) {
    parseUnit(unit.id);
    if (seen.has(unit.id)) throw new Error(`Duplicate unit: ${unit.id}`);
    seen.add(unit.id);
    if (!Array.isArray(unit.photos) || !unit.photos.length)
      throw new Error(`${unit.id} needs at least one photo.`);
    const files = new Set();
    for (const photo of unit.photos) {
      if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(photo.file))
        throw new Error(`Unsafe photo filename in ${unit.id}`);
      if (!photo.alt?.trim() || !photo.caption?.trim())
        throw new Error(`Photo text missing in ${unit.id}`);
      if (files.has(photo.file))
        throw new Error(`Duplicate photo in ${unit.id}`);
      files.add(photo.file);
    }
  }
}

export function wrapIndex(index, count) {
  return ((index % count) + count) % count;
}

export function escapeHtml(value) {
  return String(value).replace(
    /[&<>"']/g,
    (char) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        char
      ],
  );
}
