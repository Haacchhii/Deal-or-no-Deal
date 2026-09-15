import {
  escapeHtml as esc,
  photoPath,
  unitAlbumName,
  wrapIndex,
} from "./catalog.js";

export function galleryMarkup(unit) {
  const first = unit.photos[0];
  const controls = unit.photos.length > 1;
  const albumName = unitAlbumName(unit);
  const thumbnails = unit.photoGroups?.length
    ? groupedThumbnails(unit)
    : `<div class="thumbnails" aria-label="Choose a photograph">${unit.photos.map((photo, index) => thumbnail(unit, photo, index)).join("")}</div>`;
  return `<section class="gallery unified-gallery" aria-labelledby="gallery-heading" tabindex="0">
    <div class="gallery-heading"><h2 id="gallery-heading">Photo gallery</h2><p>${unit.photos.length} ${unit.photos.length === 1 ? "photograph" : "photographs"} · Unit ${esc(albumName)}</p></div>
    <div class="photo-stage">
      <img class="main-photo" src="${photoPath(unit, first)}" alt="${esc(first.alt)}" width="1800" height="1200" fetchpriority="high">
      <p class="photo-error" hidden>We couldn’t load this photo. Try another image or reload the page.</p>
      <button class="photo-arrow previous" data-step="-1" aria-label="Previous photo" ${controls ? "" : "hidden"}>←</button>
      <button class="photo-arrow next" data-step="1" aria-label="Next photo" ${controls ? "" : "hidden"}>→</button>
      <div class="photo-bottom"><span class="photo-counter">01 / ${String(unit.photos.length).padStart(2, "0")}</span><button class="expand-photo">View full screen <span aria-hidden="true">↗</span></button></div>
    </div>
    <p class="current-caption" aria-live="polite">${esc(first.caption)}</p>
    ${thumbnails}
  </section>${lightboxMarkup(unit, controls)}`;
}

function thumbnail(unit, photo, index) {
  return `<button class="thumbnail" data-index="${index}" aria-label="Show ${esc(photo.caption)}" aria-pressed="${index === 0}"><img src="${photoPath(unit, photo, "thumb")}" alt="" width="640" height="427" loading="${index === 0 ? "eager" : "lazy"}"><span>${String(index + 1).padStart(2, "0")}</span></button>`;
}

function groupedThumbnails(unit) {
  return `<div class="thumbnail-groups">${unit.photoGroups
    .map((group, groupIndex) => {
      const photos = unit.photos.slice(group.start, group.start + group.count);
      return `<section class="thumbnail-group" aria-labelledby="photo-group-${groupIndex}"><div class="thumbnail-group-heading"><h3 id="photo-group-${groupIndex}">${esc(group.label)}</h3><p>${photos.length} ${photos.length === 1 ? "photo" : "photos"}</p></div><div class="thumbnails">${photos.map((photo, offset) => thumbnail(unit, photo, group.start + offset)).join("")}</div></section>`;
    })
    .join("")}</div>`;
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
