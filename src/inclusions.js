export function inclusionsSection() {
  return `<section class="unit-inclusions" aria-labelledby="inclusions-heading"><div><p class="eyebrow">Inclusions</p><h2 id="inclusions-heading">Furnished and<br><em>move-in ready.</em></h2><p>All units are furnished and move-in ready.</p></div><ul aria-label="Included with every unit"><li><span aria-hidden="true">💧</span>Water</li><li><span aria-hidden="true">⌁</span>Wifi</li><li><span aria-hidden="true">🏢</span>Association dues</li><li><span aria-hidden="true">₱</span>Rental fee</li></ul></section>`;
}

const nearbyGroups = [
  {
    title: "Shopping & Lifestyle",
    items: [
      "Ayala Malls: Greenbelt, Glorietta, Landmark, SM Makati",
      "Century City Mall",
      "Power Plant Mall",
      "Cash & Carry / SM Hypermarket",
      "Ayala North Exchange",
      "WalterMart Makati",
    ],
  },
  {
    title: "Offices & Corporate Hubs",
    items: [
      "Ayala Central Business District",
      "RCBC Plaza",
      "GT Tower",
      "PBCOM Tower",
      "The Enterprise Center",
      "Security Bank Head Office",
      "Zuellig Building",
    ],
  },
  {
    title: "Transport Access",
    items: [
      "Ayala MRT & Buendia MRT Stations",
      "EDSA / Pasay Road / BGC Bus Terminal",
      "1 jeep to Circuit Makati / SM Jazz",
      "Dela Rosa Walkway",
    ],
  },
  {
    title: "Hospitals & Clinics",
    items: [
      "Makati Medical Center",
      "Healthway Greenbelt",
      "The Medical Tower Makati",
    ],
  },
  {
    title: "Schools & Institutions",
    items: ["CEU Makati", "FEU Makati", "STI Makati", "iAcademy"],
  },
  {
    title: "Cafés & Hangout Spots",
    items: [
      "Commune Café + Bar",
      "Starbucks Ayala Exchange",
      "CBTL Greenbelt",
      "Café Juancho (Landmark)",
      "Black Scoop Makati",
    ],
  },
  {
    title: "Parks & Open Spaces",
    items: [
      "Ayala Triangle Gardens",
      "Washington SyCip Park",
      "Legazpi Active Park",
    ],
  },
];

const nearbyPhotos = [
  {
    src: "units/_placeholders/nearby-shopping.webp",
    alt: "Placeholder for nearby shopping and lifestyle locations",
    caption: "Shopping & lifestyle nearby",
  },
  {
    src: "units/_placeholders/nearby-business.webp",
    alt: "Placeholder for nearby offices and transport access",
    caption: "Business districts and transit access",
  },
  {
    src: "units/_placeholders/nearby-parks.webp",
    alt: "Placeholder for nearby parks and open spaces",
    caption: "Parks, cafés, and everyday essentials",
  },
];

export function nearbyLocationsSection() {
  return `<section class="nearby-locations" aria-labelledby="nearby-heading"><div class="nearby-heading"><p class="eyebrow">Nearby Locations</p><h2 id="nearby-heading">Prime location,<br><em>steps away.</em></h2><p>Everything you need is within easy reach from Victoria De Makati.</p></div><div class="nearby-photo-grid">${nearbyPhotos.map((photo) => `<figure><img src="${photo.src}" alt="${photo.alt}" width="640" height="427" loading="lazy"><figcaption>${photo.caption}</figcaption></figure>`).join("")}</div><div class="nearby-grid">${nearbyGroups.map((group) => `<section class="nearby-group"><h3>${group.title}</h3><ul>${group.items.map((item) => `<li>${item}</li>`).join("")}</ul></section>`).join("")}</div></section>`;
}
