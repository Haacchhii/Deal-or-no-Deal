export function parseUnit(id) {
  const simple = /^(\d{1,2})(\d{2})([AB])$/.exec(id);
  if (simple) {
    if (Number(simple[1]) < 1 || Number(simple[2]) < 1)
      throw new Error(`Invalid unit number: ${id}`);
    return {
      id,
      floor: Number(simple[1]),
      number: simple[2],
      tower: simple[3],
    };
  }
  const compactCombined = /^(\d{1,2})(\d{2})-(\d{2})([AB])$/.exec(id);
  if (compactCombined) {
    if (
      Number(compactCombined[1]) < 1 ||
      Number(compactCombined[2]) < 1 ||
      Number(compactCombined[3]) < 1
    )
      throw new Error(`Invalid unit number: ${id}`);
    return {
      id,
      floor: Number(compactCombined[1]),
      number: `${compactCombined[2]}-${compactCombined[3]}`,
      tower: compactCombined[4],
    };
  }
  const explicitCombined =
    /^(\d{1,2})(\d{2})([AB])-(\d{1,2})(\d{2})([AB])$/.exec(id);
  if (!explicitCombined) throw new Error(`Invalid unit number: ${id}`);
  const startFloor = Number(explicitCombined[1]);
  const endFloor = Number(explicitCombined[4]);
  if (
    startFloor < 1 ||
    Number(explicitCombined[2]) < 1 ||
    Number(explicitCombined[5]) < 1 ||
    startFloor !== endFloor ||
    explicitCombined[3] !== explicitCombined[6]
  )
    throw new Error(`Invalid unit number: ${id}`);
  return {
    id,
    floor: startFloor,
    number: `${explicitCombined[2]}-${explicitCombined[5]}`,
    tower: explicitCombined[3],
  };
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
    .map((unit) => {
      const details = parseUnit(unit.unitNumber || unit.id);
      return {
        ...unit,
        floor: details.floor,
        number: details.number,
        tower: details.tower,
        unitNumber: unit.unitNumber || details.id,
      };
    })
    .filter((unit) => unit.tower === tower)
    .sort(
      (a, b) =>
        b.floor - a.floor ||
        Number(a.number.split("-")[0]) - Number(b.number.split("-")[0]),
    )
    .forEach((unit) =>
      groups.set(unit.floor, [...(groups.get(unit.floor) || []), unit]),
    );
  return [...groups].map(([floor, items]) => ({ floor, units: items }));
}

export function photoPath(unit, photo, size = "full") {
  const folder = photo.placeholder ? "_placeholders" : unit.id;
  const category = !photo.placeholder && photo.folder ? `${photo.folder}/` : "";
  return `units/${folder}/${category}${photo.file}${size === "thumb" ? "-thumb" : ""}.webp`;
}

export function unitDisplayName(unit) {
  return unit.displayName || unit.unitNumber || unit.id;
}

export function unitDetailLabel(unit) {
  const rentalLabel = unit.rentalTypes?.length
    ? unit.rentalTypes.join(" & ")
    : unit.rentalType;
  return [rentalLabel, unit.spaceLabel].filter(Boolean).join(" · ");
}

export function unitRentalTypes(unit) {
  return unit.rentalTypes || (unit.rentalType ? [unit.rentalType] : []);
}

export function unitHasRentalType(unit, rentalType) {
  return !rentalType || unitRentalTypes(unit).includes(rentalType);
}

export function unitAlbumName(unit) {
  const detail = unitDetailLabel(unit);
  return detail
    ? `${unitDisplayName(unit)} · ${detail}`
    : unitDisplayName(unit);
}

export function directoryCoverPhoto(unit) {
  return unit.photos[0];
}

export function findUnitsByExactLabel(units, input) {
  const query = String(input).trim().toLowerCase();
  return units.filter((unit) =>
    [unit.id, unit.unitNumber, unit.displayName]
      .filter(Boolean)
      .some((value) => value.toLowerCase() === query),
  );
}

export function validateCatalog(catalog) {
  const seen = new Set();
  if (!catalog.name || !Array.isArray(catalog.units))
    throw new Error("Catalog requires a name and units array.");
  if (catalog.location) {
    if (
      !catalog.location.name?.trim() ||
      !catalog.location.address?.trim() ||
      !/^https:\/\/www\.google\.com\/maps/.test(catalog.location.mapsUrl || "") ||
      !/^https:\/\/www\.google\.com\/maps/.test(catalog.location.embedUrl || "")
    )
      throw new Error("Catalog location requires a Google Maps link.");
  }
  if (catalog.contact) {
    if (
      !/^09\d{2} ?\d{3} ?\d{4}$/.test(catalog.contact.phone || "") ||
      !/^https:\/\/(?:www\.)?facebook\.com\//.test(
        catalog.contact.facebookUrl || "",
      )
    )
      throw new Error("Catalog contact requires a Philippine mobile number and Facebook link.");
  }
  for (const unit of catalog.units) {
    if (
      unit.rentalTypes &&
      (!Array.isArray(unit.rentalTypes) ||
        unit.rentalTypes.length < 2 ||
        unit.rentalTypes.some(
          (type) => !["Bedspace", "Bedroom"].includes(type),
        ) ||
        new Set(unit.rentalTypes).size !== unit.rentalTypes.length)
    )
      throw new Error(`Invalid rental types for ${unit.id}.`);
    if (
      unit.rentalType &&
      !["Bedspace", "Bedroom"].includes(unit.rentalType)
    )
      throw new Error(`Invalid rental type for ${unit.id}.`);
    if (unit.rentalType && unit.rentalTypes)
      throw new Error(`Use one rental type format for ${unit.id}.`);
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/i.test(unit.id))
      throw new Error(`Unsafe unit route id: ${unit.id}`);
    parseUnit(unit.unitNumber || unit.id);
    if (seen.has(unit.id)) throw new Error(`Duplicate unit: ${unit.id}`);
    seen.add(unit.id);
    if (!Array.isArray(unit.photos) || !unit.photos.length)
      throw new Error(`${unit.id} needs at least one photo.`);
    if (unit.photoGroups) {
      if (
        !Array.isArray(unit.photoGroups) ||
        !unit.photoGroups.length ||
        unit.photoGroups.some(
          (group) =>
            !group.label?.trim() ||
            !Number.isInteger(group.start) ||
            !Number.isInteger(group.count) ||
            group.start < 0 ||
            group.count < 1 ||
            group.start + group.count > unit.photos.length,
        )
      )
        throw new Error(`Invalid photo groups for ${unit.id}.`);
      const groupedIndexes = unit.photoGroups.flatMap((group) =>
        Array.from({ length: group.count }, (_, index) => group.start + index),
      );
      if (
        groupedIndexes.length !== unit.photos.length ||
        new Set(groupedIndexes).size !== unit.photos.length
      )
        throw new Error(`Photo groups must cover every photo in ${unit.id}.`);
    }
    const files = new Set();
    for (const photo of unit.photos) {
      if (photo.folder && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(photo.folder))
        throw new Error(`Unsafe photo folder in ${unit.id}`);
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
