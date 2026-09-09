import catalog from "./catalog.json";
import {
  escapeHtml as esc,
  groupUnits,
  parseUnit,
  ordinal,
  photoPath,
  validateCatalog,
} from "./catalog.js";
import { galleryMarkup, mountGallery } from "./gallery.js";
import "./styles.css";

validateCatalog(catalog);
const app = document.querySelector("#app");
let cleanup = () => {};
const directoryPositions = new Map();
let previousRoute;
const mark = `<svg viewBox="0 0 40 48" fill="none" aria-hidden="true"><path d="M3 45h8V14l7-5v36m4 0V3l8 6v36h7M30 17l5 4v24" stroke="currentColor" stroke-width="1.5"/></svg>`;
const brand = `<a class="brand" href="#/" aria-label="${esc(catalog.name)} home">${mark}<span>${esc(catalog.name)}</span></a>`;

function header(active) {
  return `<header class="site-header">${brand}<nav aria-label="Main navigation"><a href="#/" ${active === "home" ? 'aria-current="page"' : ""}>Home</a><a href="#/units?tower=A" ${active === "units" ? 'aria-current="page"' : ""}>Our units</a><a class="button header-cta" href="#/units?tower=A">Explore the units <span aria-hidden="true">↗</span></a></nav></header>`;
}
function footer() {
  return `<footer class="site-footer"><span>${esc(catalog.name)}</span><p>${catalog.preview ? "Design preview · Placeholder name & sample interiors" : "A closer look at your next home."}</p><a href="#/units?tower=A">Explore the units <span aria-hidden="true">↗</span></a></footer>`;
}
function home() {
  return `${header("home")}<main id="main" tabindex="-1"><section class="hero" aria-labelledby="home-heading">
    <img class="hero-photo" src="${esc(catalog.hero.src)}" alt="${esc(catalog.hero.alt)}" width="1800" height="1200" fetchpriority="high">
    <div class="hero-shade"></div><div class="hero-content"><p class="eyebrow">A space to call your own</p><h1 id="home-heading">A closer look at<br>your next <em>home.</em></h1><p class="hero-intro">Explore our spaces. Find your favorite.</p><a class="button button-light" href="#/units?tower=A">Browse unit photos <span aria-hidden="true">↗</span></a></div>
    <span class="hero-note">${catalog.preview ? "Illustrative interior · Design preview" : "Discover the residences"}</span>
    <a class="hero-scroll" href="#/units?tower=A" aria-label="Explore our unit collection">Explore <span aria-hidden="true">↓</span></a>
  </section><section class="tower-intro" aria-labelledby="towers-heading"><p class="eyebrow"><span class="fine-line"></span>The collection</p><h2 id="towers-heading">Two towers.<br><em>Your point of view.</em></h2><div class="tower-links"><a href="#/units?tower=A"><span>Tower A</span><span aria-hidden="true">↗</span></a><a href="#/units?tower=B"><span>Tower B</span><span aria-hidden="true">↗</span></a></div></section></main>${footer()}`;
}

function directory(tower) {
  const groups = groupUnits(catalog.units, tower);
  return `${header("units")}<main class="directory page-shell" id="main" tabindex="-1"><div class="breadcrumb"><a href="#/">Home</a><span>/</span><span>Our units</span></div><div class="directory-heading"><div><p class="eyebrow">The collection</p><h1>Find your <em>space.</em></h1><p class="intro">Choose a tower. Take a look inside.</p></div><p class="collection-note">${catalog.preview ? "A first look, with sample interiors.<br>Actual unit photographs coming soon." : "Explore the photographs<br>before your personal viewing."}</p></div>
    <nav class="tower-tabs" aria-label="Choose a tower">${["A", "B"].map((t) => `<a href="#/units?tower=${t}" ${t === tower ? 'aria-current="page"' : ""}>Tower ${t}<span aria-hidden="true">↗</span></a>`).join("")}</nav>
    <div class="floor-list">${groups.length ? groups.map((group) => `<section class="floor-row" id="floor-${group.floor}" aria-labelledby="floor-heading-${group.floor}"><div class="floor-label"><p class="eyebrow">Tower ${tower}</p><h2 id="floor-heading-${group.floor}">${ordinal(group.floor)} floor</h2><p>${group.units.length} ${group.units.length === 1 ? "album" : "albums"}</p></div><div class="unit-grid">${group.units.map((unit) => `<a class="unit-album" href="#/units/${unit.id}" aria-label="View unit ${unit.id} photo album"><div class="unit-cover"><img src="${photoPath(unit, unit.photos[0], "thumb")}" alt="${esc(unit.photos[0].alt)}" width="640" height="427" loading="lazy">${unit.sample ? '<span class="sample-tag">Sample interiors</span>' : ""}<span class="cover-arrow" aria-hidden="true">↗</span></div><div class="unit-title"><h3>${unit.id}</h3><span>${unit.photos.length} photos <span aria-hidden="true">↗</span></span></div></a>`).join("")}</div></section>`).join("") : '<div class="empty-state"><h2>More spaces, soon.</h2><p>Photo albums for this tower have not been added yet.</p></div>'}</div>
    <p class="directory-footnote">Photos are for viewing reference. Please confirm current availability with the office.</p></main>${footer()}`;
}

function album(unit) {
  const details = parseUnit(unit.id);
  return `${header("units")}<main class="album page-shell" id="main" tabindex="-1"><div class="breadcrumb"><a href="#/units?tower=${details.tower}">Our units</a><span>/</span><a href="#/units?tower=${details.tower}">Tower ${details.tower}</a><span>/</span><span>${ordinal(details.floor)} floor</span></div><div class="album-heading"><div><h1>Unit <em>${unit.id}</em></h1><p class="intro">Tower ${details.tower} <span aria-hidden="true">·</span> ${ordinal(details.floor)} floor</p></div><a class="back-link" href="#/units?tower=${details.tower}">← Back to units</a></div>${unit.sample ? '<p class="sample-notice">Sample interiors · These images illustrate the gallery and are not photographs of this unit.</p>' : ""}${galleryMarkup(unit)}</main>${footer()}`;
}

function getRoute() {
  const [path, query = ""] = location.hash.slice(1).split("?");
  if (!path || path === "/") return { type: "home" };
  if (path === "/units")
    return {
      type: "directory",
      tower: new URLSearchParams(query).get("tower") === "B" ? "B" : "A",
    };
  const match = /^\/units\/([0-9]+[AB])$/.exec(path);
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
  document.title = `${route.type === "album" ? `Unit ${route.unit.id}` : route.type === "directory" ? `Tower ${route.tower} · Our units` : route.type === "missing" ? "Album not found" : "A closer look at your next home"} | ${catalog.name}`;
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
