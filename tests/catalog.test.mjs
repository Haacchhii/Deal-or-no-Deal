import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  parseUnit,
  ordinal,
  groupUnits,
  validateCatalog,
  photoPath,
  directoryCoverPhoto,
  unitAlbumName,
  unitDetailLabel,
  unitDisplayName,
  wrapIndex,
  escapeHtml,
} from "../src/catalog.js";
import { galleryMarkup } from "../src/gallery.js";
import { inclusionsSection, nearbyLocationsSection } from "../src/inclusions.js";

test("real identifiers preserve the unit component and derive tower and floor", () => {
  assert.deepEqual(parseUnit("2103B"), {
    id: "2103B",
    floor: 21,
    number: "03",
    tower: "B",
  });
  assert.deepEqual(parseUnit("1224-25B"), {
    id: "1224-25B",
    floor: 12,
    number: "24-25",
    tower: "B",
  });
  assert.deepEqual(parseUnit("1619A-1620A"), {
    id: "1619A-1620A",
    floor: 16,
    number: "19-20",
    tower: "A",
  });
  assert.equal(parseUnit("1504A").floor, 15);
  for (const id of ["2103C", "../2103B", "0000A", "2100B", "1619A-1720A"])
    assert.throws(() => parseUnit(id));
});
test("floor labels handle teen suffixes", () => {
  assert.deepEqual([1, 2, 3, 11, 12, 13, 21, 22].map(ordinal), [
    "1st",
    "2nd",
    "3rd",
    "11th",
    "12th",
    "13th",
    "21st",
    "22nd",
  ]);
});
test("groups only requested tower, numerically sorted by floor then unit", () => {
  const units = ["1504A", "2103B", "1504B", "2101B"].map((id) => ({ id }));
  assert.deepEqual(
    groupUnits(units, "B").map((g) => g.units.map((u) => u.id)),
    [["2101B", "2103B"], ["1504B"]],
  );
  assert.deepEqual(groupUnits([], "A"), []);
});
test("route-safe albums can share one real unit number", () => {
  const splitUnit = {
    id: "1633A-1st-floor",
    unitNumber: "1633A",
    displayName: "1633A",
    spaceLabel: "1st Floor",
    photos: [{ file: "living-room", alt: "Living room", caption: "Living area" }],
  };
  assert.doesNotThrow(() =>
    validateCatalog({ name: "Example", units: [splitUnit] }),
  );
  const [sixteenthFloor] = groupUnits([splitUnit], "A");
  assert.equal(sixteenthFloor.floor, 16);
  assert.equal(sixteenthFloor.units[0].id, "1633A-1st-floor");
  assert.equal(sixteenthFloor.units[0].unitNumber, "1633A");
  assert.equal(unitDisplayName(splitUnit), "1633A");
  assert.equal(unitAlbumName(splitUnit), "1633A · 1st Floor");
});
test("rental type labels remain distinct from existing unit details", () => {
  const bedspace = {
    id: "1912B",
    rentalType: "Bedspace",
    spaceLabel: "All Girls",
  };
  assert.equal(unitDetailLabel(bedspace), "Bedspace · All Girls");
  assert.equal(unitAlbumName(bedspace), "1912B · Bedspace · All Girls");
  const combined = {
    id: "1023B",
    rentalTypes: ["Bedroom", "Bedspace"],
    photos: unit.photos,
  };
  assert.equal(unitDetailLabel(combined), "Bedroom & Bedspace");
  assert.equal(unitAlbumName(combined), "1023B · Bedroom & Bedspace");
  assert.doesNotThrow(() =>
    validateCatalog({ name: "Example", units: [combined] }),
  );
  assert.throws(() =>
    validateCatalog({
      name: "Example",
      units: [{ ...unit, rentalType: "Shared room" }],
    }),
  );
});
test("combined bedroom and bedspace albums show grouped photo choices", () => {
  const groupedUnit = {
    id: "1023B",
    rentalTypes: ["Bedroom", "Bedspace"],
    photos: [
      { file: "bedroom-1", alt: "Bedroom one", caption: "Bedroom photo 1" },
      { file: "bedroom-2", alt: "Bedroom two", caption: "Bedroom photo 2" },
      { file: "bedspace-1", alt: "Bedspace one", caption: "Bedspace photo 1" },
      { file: "bedspace-2", alt: "Bedspace two", caption: "Bedspace photo 2" },
    ],
  };
  groupedUnit.photoGroups = [
    { label: "Bedroom", start: 0, count: 2 },
    { label: "Bedspace", start: 2, count: 2 },
  ];
  const markup = galleryMarkup(groupedUnit);
  assert.match(markup, /class="gallery grouped-gallery"/);
  assert.match(markup, />Bedroom<\/h2>/);
  assert.match(markup, />Bedspace<\/h2>/);
  assert.match(markup, /01 \/ 04/);
  assert.equal((markup.match(/class="grouped-photo"/g) || []).length, 4);
});
const unit = {
  id: "2103B",
  photos: [{ file: "living-room", alt: "Living room", caption: "Living area" }],
};
test("catalog rejects duplicates, empty albums and unsafe paths before building", () => {
  assert.doesNotThrow(() =>
    validateCatalog({ name: "Example", units: [unit] }),
  );
  assert.doesNotThrow(() =>
    validateCatalog({
      name: "Example",
      location: {
        name: "Victoria De Makati Condominium",
        address: "Washington St, Brgy. Pio del Pilar, Makati",
        mapsUrl: "https://www.google.com/maps?output=search&q=victoria+de+makati",
        embedUrl: "https://www.google.com/maps?q=victoria+de+makati&output=embed",
      },
      units: [unit],
    }),
  );
  assert.throws(() =>
    validateCatalog({
      name: "Example",
      location: {
        name: "Victoria De Makati Condominium",
        address: "Washington St, Brgy. Pio del Pilar, Makati",
        mapsUrl: "javascript:alert(1)",
        embedUrl: "https://www.google.com/maps?q=victoria+de+makati&output=embed",
      },
      units: [unit],
    }),
  );
  assert.throws(() =>
    validateCatalog({ name: "Example", units: [unit, unit] }),
  );
  assert.throws(() =>
    validateCatalog({ name: "Example", units: [{ ...unit, photos: [] }] }),
  );
  assert.throws(() =>
    validateCatalog({
      name: "Example",
      units: [
        { ...unit, photos: [{ file: "../secret", alt: "a", caption: "b" }] },
      ],
    }),
  );
  assert.equal(
    photoPath(unit, unit.photos[0], "thumb"),
    "units/2103B/living-room-thumb.webp",
  );
  assert.equal(
    photoPath(unit, { file: "building", placeholder: true }, "thumb"),
    "units/_placeholders/building-thumb.webp",
  );
});
test("gallery wraps both directions, including single-photo albums", () => {
  assert.equal(wrapIndex(-1, 3), 2);
  assert.equal(wrapIndex(3, 3), 0);
  assert.equal(wrapIndex(-1, 1), 0);
});
test("directory cards use the main living room photo for six-photo albums", () => {
  const sixPhotoUnit = {
    id: "1210B",
    photos: [
      { file: "building", alt: "Building exterior", caption: "The building" },
      { file: "living", alt: "Living room", caption: "Living & dining" },
      { file: "stairs", alt: "Staircase", caption: "Staircase" },
      { file: "sleep", alt: "Bedroom", caption: "Sleeping area" },
      { file: "bath", alt: "Bathroom", caption: "Bathroom" },
      { file: "pool", alt: "Pool", caption: "Pool area" },
    ],
  };
  assert.equal(directoryCoverPhoto(sixPhotoUnit).file, "living");
  assert.equal(
    directoryCoverPhoto({ ...sixPhotoUnit, photos: sixPhotoUnit.photos.slice(0, 4) }).file,
    "building",
  );
});
test("four-photo albums use a selected photo display controlled by four selectors", () => {
  const fourPhotoUnit = {
    id: "1210B",
    photos: [
      { file: "living", alt: "Living room", caption: "Living & dining" },
      { file: "stairs", alt: "Staircase", caption: "Staircase" },
      { file: "sleep", alt: "Bedroom", caption: "Sleeping area" },
      { file: "bath", alt: "Bathroom", caption: "Bathroom" },
    ],
  };
  const markup = galleryMarkup(fourPhotoUnit);
  assert.match(markup, /See every <em>space/);
  assert.match(markup, /class="selected-photo photo-stage"/);
  assert.match(markup, /class="main-photo"/);
  assert.match(markup, /class="photo-counter">01 \/ 04/);
  assert.match(markup, /class="current-caption visually-hidden" aria-live="polite">Living &amp; dining/);
  assert.doesNotMatch(markup, /overview-card-label/);
  assert.match(markup, /aria-label="Show Living &amp; dining"/);
  assert.match(markup, /aria-label="Show Bathroom"/);
  assert.match(markup, /aria-pressed="true"/);
  assert.match(markup, /data-index="3"/);
  assert.doesNotMatch(markup, /walkthrough-link/);
  assert.doesNotMatch(markup, /id="walkthrough"/);
});
test("six-photo albums use building and pool as the first and last visual anchors", () => {
  const sixPhotoUnit = {
    id: "1210B",
    photos: [
      { file: "building", alt: "Building exterior", caption: "The building" },
      { file: "living", alt: "Living room", caption: "Living & dining" },
      { file: "stairs", alt: "Staircase", caption: "Staircase" },
      { file: "sleep", alt: "Bedroom", caption: "Sleeping area" },
      { file: "bath", alt: "Bathroom", caption: "Bathroom" },
      { file: "pool", alt: "Pool", caption: "Pool area" },
    ],
  };
  const markup = galleryMarkup(sixPhotoUnit);
  assert.match(markup, /Building &amp;<br><em>surroundings/);
  assert.match(markup, /Inside Unit <em>1210B<\/em>/);
  assert.match(markup, /Pool &amp;<br><em>amenities/);
  assert.match(markup, /data-index="0"/);
  assert.match(markup, /data-index="5"/);
});
test("five-photo albums use a guided three-interior layout", () => {
  const fivePhotoUnit = {
    id: "1633A-1st-floor",
    unitNumber: "1633A",
    spaceLabel: "1st Floor",
    photos: [
      { file: "building", alt: "Building exterior", caption: "The building" },
      { file: "living", alt: "Living room", caption: "Living & dining" },
      { file: "sleep", alt: "Bedroom", caption: "Sleeping area" },
      { file: "bath", alt: "Bathroom", caption: "Bathroom" },
      { file: "pool", alt: "Pool", caption: "Pool area" },
    ],
  };
  const markup = galleryMarkup(fivePhotoUnit);
  assert.match(markup, /gallery-five/);
  assert.match(markup, /02–04 \/ 05/);
  assert.match(markup, /1st Floor · Three views of the spaces inside/);
  assert.match(markup, /Inside Unit <em>1633A<\/em>/);
  assert.match(markup, /data-index="4"/);
});
test("the building guide shows furnished move-in-ready inclusions", () => {
  const markup = inclusionsSection();
  assert.match(markup, /Inclusions/);
  assert.match(markup, /All units are furnished and move-in ready/);
  assert.match(markup, /Water/);
  assert.match(markup, /Wifi/);
  assert.match(markup, /Association dues/);
  assert.match(markup, /Rental fee/);
});
test("the building guide shows nearby locations and supplied shared images", () => {
  const markup = nearbyLocationsSection();
  assert.match(markup, /Nearby Locations/);
  assert.match(markup, /Prime location/);
  assert.match(markup, /Ayala Malls/);
  assert.match(markup, /Ayala Central Business District/);
  assert.match(markup, /Makati Medical Center/);
  assert.match(markup, /Ayala Triangle Gardens/);
  assert.match(markup, /nearby\/malls\.webp/);
  assert.match(markup, /nearby\/offices\.webp/);
  assert.match(markup, /nearby\/commute\.webp/);
  assert.match(markup, /nearby\/makati-medical-center\.webp/);
  assert.match(markup, /nearby\/schools\.webp/);
  assert.match(markup, /nearby\/parks\.webp/);
  assert.match(markup, /Makati Medical Center exterior in Makati/);
  assert.match(markup, /nearby-photo-contain/);
  assert.match(markup, /nearby\/cafes\.webp/);
  assert.match(markup, /width="640" height="360"/);
  assert.doesNotMatch(markup, /nearby-photo-grid/);
});
test("catalog text cannot inject markup", () =>
  assert.equal(
    escapeHtml('<img onerror="x">'),
    "&lt;img onerror=&quot;x&quot;&gt;",
  ));
test("app code does not shadow browser location used by hash routing", () => {
  const mainSource = readFileSync(new URL("../src/main.js", import.meta.url), "utf8");
  assert.doesNotMatch(mainSource, /\bconst\s+location\s*=/);
});
