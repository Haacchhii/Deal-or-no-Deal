import test from "node:test";
import assert from "node:assert/strict";
import {
  parseUnit,
  ordinal,
  groupUnits,
  validateCatalog,
  photoPath,
  wrapIndex,
  escapeHtml,
} from "../src/catalog.js";
import { galleryMarkup } from "../src/gallery.js";

test("real identifiers preserve the unit component and derive tower and floor", () => {
  assert.deepEqual(parseUnit("2103B"), {
    id: "2103B",
    floor: 21,
    number: "03",
    tower: "B",
  });
  assert.equal(parseUnit("1504A").floor, 15);
  for (const id of ["2103C", "../2103B", "0000A", "2100B"])
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
const unit = {
  id: "2103B",
  photos: [{ file: "living-room", alt: "Living room", caption: "Living area" }],
};
test("catalog rejects duplicates, empty albums and unsafe paths before building", () => {
  assert.doesNotThrow(() =>
    validateCatalog({ name: "Example", units: [unit] }),
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
});
test("gallery wraps both directions, including single-photo albums", () => {
  assert.equal(wrapIndex(-1, 3), 2);
  assert.equal(wrapIndex(3, 3), 0);
  assert.equal(wrapIndex(-1, 1), 0);
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
  assert.match(markup, /class="current-caption" aria-live="polite">Living &amp; dining/);
  assert.match(markup, /<b>01<\/b><span>Living &amp; dining<\/span>/);
  assert.match(markup, /<b>04<\/b><span>Bathroom<\/span>/);
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
test("catalog text cannot inject markup", () =>
  assert.equal(
    escapeHtml('<img onerror="x">'),
    "&lt;img onerror=&quot;x&quot;&gt;",
  ));
