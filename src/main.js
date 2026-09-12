import catalog from "./catalog.json";
import {
  escapeHtml as esc,
  directoryCoverPhoto,
  groupUnits,
  parseUnit,
  ordinal,
  photoPath,
  unitAlbumName,
  unitDisplayName,
  validateCatalog,
} from "./catalog.js";
import { galleryMarkup, mountGallery } from "./gallery.js";
import "./styles.css";

validateCatalog(catalog);
const app = document.querySelector("#app");
let cleanup = () => {};
const directoryPositions = new Map();
let previousRoute;
const buildingName = catalog.building || "Victoria De Makati";
const brand = `<a class="brand" href="#/" aria-label="${esc(catalog.name)} home"><img src="brand/jpp-rental-homestay-logo.webp" alt="" width="180" height="180"><span>${esc(catalog.name)}</span></a>`;
const isPlaceholderAlbum = (unit) =>
  unit.photos.every((photo) => photo.placeholder);
const siteLocation = catalog.location || {
  name: buildingName,
  address: "Washington St, Brgy. Pio del Pilar, Makati",
  mapsUrl:
    "https://www.google.com/maps?output=search&q=victoria+de+makati+condominium,+washington+st,+brgy.+pio+del+pilar,+makati",
  embedUrl:
    "https://www.google.com/maps?q=victoria+de+makati+condominium,+washington+st,+brgy.+pio+del+pilar,+makati&output=embed",
};

function header(active) {
  return `<header class="site-header">${brand}<nav aria-label="Main navigation"><a href="#/" ${active === "home" ? 'aria-current="page"' : ""}>Home</a><a href="#/units?tower=A" ${active === "units" ? 'aria-current="page"' : ""}>Our units</a><a class="button header-cta" href="#/units?tower=A">Explore the units <span aria-hidden="true">↗</span></a></nav></header>`;
}
function footer() {
  return `<footer class="site-footer"><span>${esc(catalog.name)}</span><p>${esc(buildingName)} · ${catalog.preview ? "Placeholder albums are labeled" : "A closer look at your next home."}</p><a href="#/units?tower=A">Explore the units <span aria-hidden="true">↗</span></a></footer>`;
}
function locationSection() {
  return `<section class="location-section" aria-labelledby="location-heading"><div class="location-copy"><p class="eyebrow"><span class="fine-line"></span>Location</p><h2 id="location-heading">Find us at<br><em>${esc(siteLocation.name)}</em></h2><p>${esc(siteLocation.address)}</p><a class="button" href="${esc(siteLocation.mapsUrl)}" target="_blank" rel="noopener noreferrer">Open in Google Maps <span aria-hidden="true">↗</span></a></div><div class="map-card"><iframe title="${esc(siteLocation.name)} map" src="${esc(siteLocation.embedUrl)}" width="900" height="520" loading="lazy" referrerpolicy="no-referrer-when-downgrade" allowfullscreen></iframe><a class="map-overlay" href="${esc(siteLocation.mapsUrl)}" target="_blank" rel="noopener noreferrer" aria-label="Open ${esc(siteLocation.name)} on Google Maps"><span>${esc(siteLocation.name)}</span><small>${esc(siteLocation.address)}</small><b aria-hidden="true">↗</b></a></div></section>`;
}
function home() {
  return `${header("home")}<main id="main" tabindex="-1"><section class="hero" aria-labelledby="home-heading">
    <img class="hero-photo" src="${esc(catalog.hero.src)}" alt="${esc(catalog.hero.alt)}" width="${catalog.hero.width || 1800}" height="${catalog.hero.height || 1200}" fetchpriority="high">
    <div class="hero-shade"></div><div class="hero-content"><p class="eyebrow">${esc(buildingName)}</p><h1 id="home-heading">A closer look at<br>your next <em>home.</em></h1><p class="hero-intro">Explore JPP Rental Homestay units before your personal viewing.</p><a class="button button-light" href="#/units?tower=A">Browse unit photos <span aria-hidden="true">↗</span></a></div>
    <span class="hero-note">${catalog.preview ? `${esc(buildingName)} · Photo gallery preview` : `Discover ${esc(buildingName)}`}</span>
    <a class="hero-scroll" href="#/units?tower=A" aria-label="Explore our unit collection">Explore <span aria-hidden="true">↓</span></a>
  </section><section class="tower-intro" aria-labelledby="towers-heading"><p class="eyebrow"><span class="fine-line"></span>${esc(buildingName)}</p><h2 id="towers-heading">Two towers.<br><em>Your point of view.</em></h2><div class="tower-links"><a href="#/units?tower=A"><span>Tower A</span><span aria-hidden="true">↗</span></a><a href="#/units?tower=B"><span>Tower B</span><span aria-hidden="true">↗</span></a></div></section>${locationSection()}</main>${footer()}`;
}

function directory(tower) {
  const groups = groupUnits(catalog.units, tower);
  return `${header("units")}<main class="directory page-shell" id="main" tabindex="-1"><div class="breadcrumb"><a href="#/">Home</a><span>/</span><span>Our units</span></div><div class="directory-heading"><div><p class="eyebrow">${esc(buildingName)}</p><h1>Find your <em>space.</em></h1><p class="intro">Choose a tower. Take a look inside.</p></div><p class="collection-note">${catalog.preview ? "Explore unit photos and placeholders.<br>Placeholder albums are labeled." : "Explore the photographs<br>before your personal viewing."}</p></div>
    <nav class="tower-tabs" aria-label="Choose a tower">${["A", "B"].map((t) => `<a href="#/units?tower=${t}" ${t === tower ? 'aria-current="page"' : ""}>Tower ${t}<span aria-hidden="true">↗</span></a>`).join("")}</nav>
    <div class="floor-list">${groups.length ? groups.map((group) => `<section class="floor-row" id="floor-${group.floor}" aria-labelledby="floor-heading-${group.floor}"><div class="floor-label"><p class="eyebrow">Tower ${tower}</p><h2 id="floor-heading-${group.floor}">${ordinal(group.floor)} floor</h2><p>${group.units.length} ${group.units.length === 1 ? "album" : "albums"}</p></div><div class="unit-grid">${group.units.map((unit) => {
    const cover = directoryCoverPhoto(unit);
    return `<a class="unit-album" href="#/units/${unit.id}" aria-label="View ${esc(unitAlbumName(unit))} photo album"><div class="unit-cover"><img src="${photoPath(unit, cover, "thumb")}" alt="${esc(cover.alt)}" width="640" height="427" loading="lazy">${unit.sample ? `<span class="sample-tag">${isPlaceholderAlbum(unit) ? "Placeholder photos" : "Sample interiors"}</span>` : ""}<span class="cover-arrow" aria-hidden="true">↗</span></div><div class="unit-title"><h3>${esc(unitDisplayName(unit))}</h3><span>${unit.spaceLabel ? `${esc(unit.spaceLabel)} · ` : ""}${unit.photos.length} photos <span aria-hidden="true">↗</span></span></div></a>`;
  }).join("")}</div></section>`).join("") : '<div class="empty-state"><h2>More spaces, soon.</h2><p>Photo albums for this tower have not been added yet.</p></div>'}</div>
    <p class="directory-footnote">Photos are for viewing reference. Please confirm current availability with the office.</p></main>${footer()}`;
}

function album(unit) {
  const details = parseUnit(unit.unitNumber || unit.id);
  const albumName = unitAlbumName(unit);
  return `${header("units")}<main class="album page-shell" id="main" tabindex="-1"><div class="breadcrumb"><a href="#/units?tower=${details.tower}">Our units</a><span>/</span><span>${esc(buildingName)}</span><span>/</span><a href="#/units?tower=${details.tower}">Tower ${details.tower}</a><span>/</span><span>${ordinal(details.floor)} floor</span>${unit.spaceLabel ? `<span>/</span><span>${esc(unit.spaceLabel)}</span>` : ""}</div><div class="album-heading"><div><h1>Unit <em>${esc(unitDisplayName(unit))}</em></h1><p class="intro">${esc(buildingName)} <span aria-hidden="true">·</span> Tower ${details.tower} <span aria-hidden="true">·</span> ${ordinal(details.floor)} floor${unit.spaceLabel ? ` <span aria-hidden="true">·</span> ${esc(unit.spaceLabel)}` : ""}</p></div><a class="back-link" href="#/units?tower=${details.tower}">← Back to units</a></div>${unit.sample ? `<p class="sample-notice">${isPlaceholderAlbum(unit) ? `Placeholder photos · Replace these images when ${esc(albumName)} photos are available.` : "Sample interiors · These images illustrate the gallery and are not photographs of this unit."}</p>` : ""}${galleryMarkup(unit)}</main>${footer()}`;
}

function getRoute() {
  const [path, query = ""] = location.hash.slice(1).split("?");
  if (!path || path === "/") return { type: "home" };
  if (path === "/units")
    return {
      type: "directory",
      tower: new URLSearchParams(query).get("tower") === "B" ? "B" : "A",
    };
  const match = /^\/units\/([A-Za-z0-9-]+)$/.exec(path);
  const unit = match && catalog.units.find((unit) => unit.id === match[1]);
  return unit ? { type: "album", unit } : { type: "missing" };
}
function render({ initial = false } = {}) {
  if (previousRoute?.type === "directory")
    directoryPositions.set(previousRoute.tower, window.scrollY);
  cleanup();
  const route = getRoute();
  const returning =
    previousRoute?.type === "album" && route.type === "directory";
  app.innerHTML =
    route.type === "home"
      ? home()
      : route.type === "directory"
        ? directory(route.tower)
        : route.type === "album"
          ? album(route.unit)
          : `${header("units")}<main id="main" class="page-shell empty-state" tabindex="-1"><p class="eyebrow">Our collection</p><h1>That album isn’t here.</h1><p>The unit may not have photos yet, or the link may be incorrect.</p><a class="button" href="#/units?tower=A">Back to the units ↗</a></main>${footer()}`;
  document.title = `${route.type === "album" ? `Unit ${unitAlbumName(route.unit)}` : route.type === "directory" ? `Tower ${route.tower} · ${buildingName}` : route.type === "missing" ? "Album not found" : buildingName} | ${catalog.name}`;
  cleanup = route.type === "album" ? mountGallery(route.unit) : () => {};
  document
    .querySelectorAll(".unit-cover img, .hero-photo")
    .forEach((img) =>
      img.addEventListener("error", () =>
        img.classList.add("image-unavailable"),
      ),
    );
  requestAnimationFrame(() => {
    if (!initial)
      document.querySelector("#main").focus({ preventScroll: true });
    window.scrollTo({
      top: returning ? directoryPositions.get(route.tower) || 0 : 0,
      behavior: "instant",
    });
  });
  previousRoute = route;
}
window.addEventListener("hashchange", () => {
  if (location.hash !== "#main") render();
});
document.querySelector(".skip-link").addEventListener("click", (event) => {
  event.preventDefault();
  document.querySelector("#main").focus();
});
if ("scrollRestoration" in history) history.scrollRestoration = "manual";
render({ initial: true });
