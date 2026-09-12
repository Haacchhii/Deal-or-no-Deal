export function inclusionsSection() {
  return `<section class="unit-inclusions" aria-labelledby="inclusions-heading"><div><p class="eyebrow">Inclusions</p><h2 id="inclusions-heading">Furnished and<br><em>move-in ready.</em></h2><p>All units are furnished and move-in ready.</p></div><ul aria-label="Included with every unit"><li><span aria-hidden="true">💧</span>Water</li><li><span aria-hidden="true">⌁</span>Wifi</li><li><span aria-hidden="true">🏢</span>Association dues</li><li><span aria-hidden="true">₱</span>Rental fee</li></ul></section>`;
}

const nearbyGroups = [
  {
    title: "Shopping & Lifestyle",
    photo: {
      src: "units/_placeholders/nearby-shopping.webp",
      alt: "Placeholder for nearby shopping and lifestyle locations",
    },
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
    photo: {
      src: "units/_placeholders/nearby-business.webp",
      alt: "Placeholder for nearby offices and corporate hubs",
    },
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
    photo: {
      src: "units/_placeholders/nearby-business.webp",
      alt: "Placeholder for nearby transport access",
    },
    items: [
      "Ayala MRT & Buendia MRT Stations",
      "EDSA / Pasay Road / BGC Bus Terminal",
      "1 jeep to Circuit Makati / SM Jazz",
      "Dela Rosa Walkway",
    ],
  },
  {
    title: "Hospitals & Clinics",
    photo: {
      src: "units/_placeholders/nearby-business.webp",
      alt: "Placeholder for nearby hospitals and clinics",
    },
    items: [
      "Makati Medical Center",
      "Healthway Greenbelt",
      "The Medical Tower Makati",
    ],
  },
  {
    title: "Schools & Institutions",
    photo: {
      src: "units/_placeholders/nearby-business.webp",
      alt: "Placeholder for nearby schools and institutions",
    },
    items: ["CEU Makati", "FEU Makati", "STI Makati", "iAcademy"],
  },
  {
    title: "Cafés & Hangout Spots",
    photo: {
      src: "units/_placeholders/nearby-parks.webp",
      alt: "Placeholder for nearby cafés and hangout spots",
    },
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
    photo: {
      src: "units/_placeholders/nearby-parks.webp",
      alt: "Placeholder for nearby parks and open spaces",
    },
    items: [
      "Ayala Triangle Gardens",
      "Washington SyCip Park",
      "Legazpi Active Park",
    ],
  },
];

export function nearbyLocationsSection() {
  return `<section class="nearby-locations" aria-labelledby="nearby-heading"><div class="nearby-heading"><p class="eyebrow">Nearby Locations</p><h2 id="nearby-heading">Prime location,<br><em>steps away.</em></h2><p>Everything you need is within easy reach from Victoria De Makati.</p></div><div class="nearby-grid">${nearbyGroups.map((group) => `<section class="nearby-group"><img src="${group.photo.src}" alt="${group.photo.alt}" width="180" height="120" loading="lazy"><div><h3>${group.title}</h3><ul>${group.items.map((item) => `<li>${item}</li>`).join("")}</ul></div></section>`).join("")}</div></section>`;
}
