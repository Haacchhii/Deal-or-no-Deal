export function inclusionsSection() {
  return `<section class="unit-inclusions" aria-labelledby="inclusions-heading"><div><p class="eyebrow">Inclusions</p><h2 id="inclusions-heading">Furnished and<br><em>move-in ready.</em></h2><p>All units are furnished and move-in ready.</p></div><ul aria-label="Included with every unit"><li><span aria-hidden="true">💧</span>Water</li><li><span aria-hidden="true">⌁</span>Wifi</li><li><span aria-hidden="true">🏢</span>Association dues</li><li><span aria-hidden="true">₱</span>Rental fee</li></ul></section>`;
}

const nearbyGroups = [
  {
    title: "Shopping & Lifestyle",
    photo: {
      src: "nearby/malls.webp",
      alt: "Greenbelt shopping complex and surrounding buildings in Makati",
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
      src: "nearby/offices.webp",
      alt: "Makati central business district skyline at dusk",
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
      src: "nearby/commute.webp",
      alt: "Commute route map connecting PITX, Pasay and Makati stops",
      fit: "contain",
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
      src: "nearby/makati-medical-center.webp",
      alt: "Makati Medical Center exterior in Makati",
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
      src: "nearby/schools.webp",
      alt: "Centro Escolar University Makati campus exterior",
    },
    items: ["CEU Makati", "FEU Makati", "STI Makati", "iAcademy"],
  },
  {
    title: "Cafés & Hangout Spots",
    photo: {
      src: "nearby/cafes.webp",
      alt: "Starbucks storefront with illuminated green logo and sign",
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
      src: "nearby/parks.webp",
      alt: "Ayala Triangle Gardens surrounded by the Makati skyline",
    },
    items: [
      "Ayala Triangle Gardens",
      "Washington SyCip Park",
      "Legazpi Active Park",
    ],
  },
];

export function nearbyLocationsSection() {
  return `<section class="nearby-locations" aria-labelledby="nearby-heading"><div class="nearby-heading"><p class="eyebrow">Nearby Locations</p><h2 id="nearby-heading">Prime location,<br><em>steps away.</em></h2><p>Everything you need is within easy reach from Victoria De Makati.</p></div><div class="nearby-grid">${nearbyGroups.map((group) => `<section class="nearby-group"><img class="nearby-photo${group.photo.fit === "contain" ? " nearby-photo-contain" : ""}" src="${group.photo.src}" alt="${group.photo.alt}" width="640" height="360" loading="lazy"><div><h3>${group.title}</h3><ul>${group.items.map((item) => `<li>${item}</li>`).join("")}</ul></div></section>`).join("")}</div></section>`;
}
