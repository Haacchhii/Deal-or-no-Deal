# Unit Page agent guidance

## Product

Unit Page is a public, photo-first showcase for JPP Rental Homestay units at Victoria De Makati. Its purpose is to help prospective tenants browse real unit photographs before arranging an in-person viewing. Keep the experience fast, calm, trustworthy, and easy to use on phones and laptops.

The first release is a static Vite site. Do not add prices, live availability, booking, payments, accounts, room specifications, or additional properties unless the user explicitly expands the scope.

## Sources of truth

- `src/catalog.json` owns unit and photo content. Do not embed catalog data or photo filenames in UI components.
- `design/condo-gallery-direction.md` defines the established visual and interaction direction.
- `src/styles.css` owns the design tokens and responsive system.
- `src/catalog.js` owns unit parsing and derived photo paths.
- Real photographs live in `public/units/<unit-id>/`; shared placeholders live in `public/units/_placeholders/`.

Never invent unit availability, amenities, measurements, contact information, or property claims. Preserve real unit identifiers and leading zeroes. Clearly distinguish real photographs, sample interiors, and placeholders.

## Design work

For frontend UI/UX design, use both `.agents/skills/impeccable/SKILL.md` and `.agents/skills/unit-page-design/SKILL.md`. Impeccable supplies the general design vocabulary and craft workflow; Unit Page Design supplies the repository-specific product, visual, content, and verification constraints. Preserve the boutique residence direction: forest green, ivory, restrained brass, editorial serif headings, clear sans-serif controls, generous spacing, and photography as the primary visual element.

Treat the existing design as a coherent system. Prefer focused improvements over wholesale restyling unless a redesign is explicitly requested. Reuse tokens and components, avoid nested card-heavy layouts, and keep labels and actions understandable without decorative effects.

## Content and photographs

- The first photograph is the album cover unless the catalog helpers deliberately select another image.
- For six-photo albums, preserve this order: building exterior, four unit photographs, then pool/amenity.
- Set `sample: false` only when the album represents the owner's real unit photographs.
- Set `placeholder: true` on placeholder entries.
- Do not modify originals. Use `npm run photos -- <unit-id> <source-directory>` to generate optimized WebP copies and thumbnails.
- Do not delete old photographs as part of a content update. Remove unused assets only as a separate, explicitly requested cleanup.

## Accessibility and interaction

Maintain semantic landmarks and heading order, visible keyboard focus, usable touch targets, descriptive alt text, gallery keyboard controls, Escape-to-close behavior, focus restoration, reduced-motion support, and readable contrast. Do not use color alone to convey selection or status.

## Verification

For implementation changes, run the checks proportionate to the change. Before considering a frontend or catalog change complete, normally run:

```sh
npm test
npm run build
```

For visual changes, inspect the rendered site at a narrow phone viewport and a wide desktop viewport. Check the landing page, both tower directories, a four-photo album, a five- or six-photo album, placeholder labels, keyboard focus, and the full-screen viewer when affected. Report what was inspected and any remaining uncertainty.

Use `.agents/skills/unit-page-visual-qa/SKILL.md` for rendered browser verification and `.agents/skills/unit-page-accessibility/SKILL.md` for a focused accessibility audit. Keep review findings evidence-based and limited to the requested or changed flow.

Deployment or publication is a separate action. Prepare and verify changes first; publish only when the user requests it.
