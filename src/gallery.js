import {
  escapeHtml as esc,
  photoPath,
  unitAlbumName,
  unitDisplayName,
  wrapIndex,
} from "./catalog.js";

export function galleryMarkup(unit) {
  const first = unit.photos[0];
  const controls = unit.photos.length > 1;
  const albumName = unitAlbumName(unit);
  if (unit.photos.length === 6) return sixPhotoGallery(unit, controls);
  if (unit.photos.length === 4) {
    return `<section class="gallery gallery-walkthrough" aria-label="Unit ${esc(albumName)} photographs" tabindex="0">
      <section class="gallery-overview" aria-labelledby="overview-heading">
        <div class="gallery-section-heading"><p class="eyebrow">At a glance</p><h2 id="overview-heading">See every <em>space.</em></h2><p>Choose a photo below to update the main view.</p></div>
        <div class="selected-photo photo-stage">
          <img class="main-photo" src="${photoPath(unit, first)}" alt="${esc(first.alt)}" width="1800" height="1200" fetchpriority="high">
          <p class="photo-error" hidden>We couldn’t load this photo. Try another image or reload the page.</p>
          <button class="photo-arrow previous" data-step="-1" aria-label="Previous photo">←</button>
          <button class="photo-arrow next" data-step="1" aria-label="Next photo">→</button>
          <div class="photo-bottom"><span class="photo-counter">01 / 04</span><button class="expand-photo">View full screen <span aria-hidden="true">↗</span></button></div>
        </div>
        <div class="gallery-caption"><span class="current-caption" aria-live="polite">${esc(first.caption)}</span><span>Select from the photos below</span></div>
        <div class="overview-grid">${unit.photos.map((photo, index) => `<button class="overview-card" data-index="${index}" aria-label="Show ${esc(photo.caption)}" aria-pressed="${index === 0}"><img src="${photoPath(unit, photo, "thumb")}" alt="${esc(photo.alt)}" width="640" height="427" loading="${index === 0 ? "eager" : "lazy"}"><span class="overview-card-label"><b>${String(index + 1).padStart(2, "0")}</b><span>${esc(photo.caption)}</span><i aria-hidden="true">↗</i></span></button>`).join("")}</div>
      </section>
    </section>${lightboxMarkup(unit, controls)}`;
  }
  return `<section class="gallery" aria-label="Unit ${esc(albumName)} photographs" tabindex="0">
    <div class="photo-stage">
      <img class="main-photo" src="${photoPath(unit, first)}" alt="${esc(first.alt)}" width="1800" height="1200" fetchpriority="high">
      <p class="photo-error" hidden>We couldn’t load this photo. Try another image or reload the page.</p>
      <button class="photo-arrow previous" data-step="-1" aria-label="Previous photo" ${controls ? "" : "hidden"}>←</button>
      <button class="photo-arrow next" data-step="1" aria-label="Next photo" ${controls ? "" : "hidden"}>→</button>
      <div class="photo-bottom"><span class="photo-counter">01 / ${String(unit.photos.length).padStart(2, "0")}</span><button class="expand-photo">View full screen <span aria-hidden="true">↗</span></button></div>
    </div>
    <div class="gallery-caption"><span class="current-caption" aria-live="polite">${esc(first.caption)}</span><span>Use arrows to explore</span></div>
    <div class="thumbnails" aria-label="Choose a photograph">${unit.photos.map((photo, index) => `<button class="thumbnail" data-index="${index}" aria-label="Show ${esc(photo.caption)}" aria-pressed="${index === 0}"><img src="${photoPath(unit, photo, "thumb")}" alt="" width="640" height="427" loading="lazy"><span>${esc(photo.caption)}</span></button>`).join("")}</div>
  </section>${lightboxMarkup(unit, controls)}`;
}

function sixPhotoGallery(unit, controls) {
  const albumName = unitAlbumName(unit);
  const displayName = unitDisplayName(unit);
  const [building, ...remaining] = unit.photos;
  const pool = remaining.pop();
  const unitPhotos = remaining;
  const feature = (photo, index, title, copy, className) => `<section class="gallery-feature ${className}"><button class="gallery-feature-photo" data-index="${index}" aria-label="View ${esc(photo.caption)} full screen"><img src="${photoPath(unit, photo)}" alt="${esc(photo.alt)}" width="1800" height="1200" loading="${index === 0 ? "eager" : "lazy"}"><span>View full screen <b aria-hidden="true">↗</b></span></button><div class="gallery-feature-copy"><p class="eyebrow">${String(index + 1).padStart(2, "0")} / 06</p><h2>${title}</h2><p>${copy}</p></div></section>`;
  return `<section class="gallery gallery-six" aria-label="Unit ${esc(albumName)} photographs" tabindex="0">
    ${feature(building, 0, "Building &amp;<br><em>surroundings.</em>", "Begin with the building and the area around your next home.", "gallery-arrival")}
    <section class="gallery-interior" aria-labelledby="interior-heading"><div class="gallery-interior-heading"><p class="eyebrow">02–05 / 06</p><h2 id="interior-heading">Inside Unit <em>${esc(displayName)}</em></h2><p>${unit.spaceLabel ? `${esc(unit.spaceLabel)} · ` : ""}Four views of the spaces inside.</p></div><div class="interior-grid">${unitPhotos.map((photo, offset) => `<button class="interior-photo" data-index="${offset + 1}" aria-label="View ${esc(photo.caption)} full screen"><img src="${photoPath(unit, photo)}" alt="${esc(photo.alt)}" width="1800" height="1200" loading="lazy"><span><b>${String(offset + 2).padStart(2, "0")}</b>${esc(photo.caption)}<i aria-hidden="true">↗</i></span></button>`).join("")}</div></section>
    ${feature(pool, 5, "Pool &amp;<br><em>amenities.</em>", "Finish with one of the spaces you can enjoy beyond the unit.", "gallery-amenity")}
  </section>${lightboxMarkup(unit, controls)}`;
}

function lightboxMarkup(unit, controls) {
  const albumName = unitAlbumName(unit);
  return `<dialog class="lightbox" aria-label="Unit ${esc(albumName)} photo viewer">
    <div class="lightbox-top"><span>UNIT ${esc(albumName)}</span><button class="close-viewer" autofocus aria-label="Close photo viewer">Close <span aria-hidden="true">×</span></button></div>
    <div class="lightbox-image"><img alt=""><p class="viewer-error" hidden>Photo could not be loaded.</p></div>
    <div class="lightbox-bottom"><button data-step="-1" aria-label="Previous photo" ${controls ? "" : "hidden"}>←</button><p class="viewer-caption" aria-live="polite"></p><button data-step="1" aria-label="Next photo" ${controls ? "" : "hidden"}>→</button></div>
  </dialog>`;
}

export function mountGallery(unit) {
  let index = 0;
  let pointerStart;
  const gallery = document.querySelector(".gallery");
  const dialog = document.querySelector(".lightbox");
  const mainImage = gallery.querySelector(".main-photo");
  const viewerImage = dialog.querySelector("img");
  const caption = gallery.querySelector(".current-caption");
  const counter = gallery.querySelector(".photo-counter");
  const buttons = [...gallery.querySelectorAll("[data-index]")];
  function syncViewer() {
    const photo = unit.photos[index];
    viewerImage.src = photoPath(unit, photo);
    viewerImage.alt = photo.alt;
    dialog.querySelector(".viewer-caption").textContent =
      `${photo.caption} · ${index + 1} / ${unit.photos.length}`;
    dialog.querySelector(".viewer-error").hidden = true;
  }
  function show(next) {
    index = wrapIndex(next, unit.photos.length);
    const photo = unit.photos[index];
    if (mainImage) {
      mainImage.src = photoPath(unit, photo);
      mainImage.alt = photo.alt;
      gallery.querySelector(".photo-error").hidden = true;
      caption.textContent = photo.caption;
      counter.textContent = `${String(index + 1).padStart(2, "0")} / ${String(unit.photos.length).padStart(2, "0")}`;
      buttons.forEach((button, i) =>
        button.setAttribute("aria-pressed", String(index === i)),
      );
    }
    if (dialog.open) syncViewer();
  }
  buttons.forEach((button) =>
    button.addEventListener("click", () => {
      show(Number(button.dataset.index));
      if (!mainImage) {
        syncViewer();
        dialog.showModal();
        document.body.classList.add("viewer-open");
      }
    }),
  );
  document
    .querySelectorAll("[data-step]")
    .forEach((button) =>
      button.addEventListener("click", () =>
        show(index + Number(button.dataset.step)),
      ),
    );
  mainImage?.addEventListener("error", () => {
    gallery.querySelector(".photo-error").hidden = false;
  });
  viewerImage.addEventListener("error", () => {
    dialog.querySelector(".viewer-error").hidden = false;
  });
  gallery.querySelector(".expand-photo")?.addEventListener("click", () => {
    syncViewer();
    dialog.showModal();
    document.body.classList.add("viewer-open");
  });
  dialog
    .querySelector(".close-viewer")
    .addEventListener("click", () => dialog.close());
  dialog.addEventListener("close", () =>
    document.body.classList.remove("viewer-open"),
  );
  function keyboard(event) {
    if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
      event.preventDefault();
      show(index + (event.key === "ArrowLeft" ? -1 : 1));
    }
  }
  gallery.addEventListener("keydown", keyboard);
  dialog.addEventListener("keydown", keyboard);
  for (const surface of [
    gallery.querySelector(".photo-stage"),
    dialog.querySelector(".lightbox-image"),
  ].filter(Boolean)) {
    surface.addEventListener("pointerdown", (event) => {
      if (event.pointerType !== "mouse")
        pointerStart = { x: event.clientX, y: event.clientY };
    });
    surface.addEventListener("pointerup", (event) => {
      if (!pointerStart) return;
      const dx = event.clientX - pointerStart.x;
      const dy = event.clientY - pointerStart.y;
      if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy))
        show(index + (dx < 0 ? 1 : -1));
      pointerStart = undefined;
    });
    surface.addEventListener("pointercancel", () => {
      pointerStart = undefined;
    });
  }
  return () => {
    if (dialog.open) dialog.close();
    document.body.classList.remove("viewer-open");
  };
}
