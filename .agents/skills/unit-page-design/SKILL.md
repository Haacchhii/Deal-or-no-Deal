---
name: unit-page-design
description: Design, review, and implement frontend UI/UX improvements for the Unit Page condo photo showcase. Use for layout, responsive behavior, navigation, gallery interaction, accessibility, visual polish, or design-system work in this repository; do not use for catalog-only photo or inventory updates.
---

# Unit Page Design

Create a polished, trustworthy photo-browsing experience that feels like a boutique residence rather than a listing marketplace. Work in the existing Vite and vanilla JavaScript architecture unless the user explicitly requests a technology change.

## Establish the design context

Before changing the interface, inspect:

- `design/condo-gallery-direction.md` for product boundaries and visual intent.
- `src/styles.css` for tokens, components, responsive rules, and motion behavior.
- The relevant renderer in `src/main.js`, `src/gallery.js`, or `src/inclusions.js`.
- At least one current rendered page when browser preview is available.

Use the concept PNGs in `design/` only as directional references. The implemented interface and the user's current request take precedence over old mockup details.

## Design principles

- Make real unit photography the dominant content.
- Preserve the forest `#183C34`, ivory `#F7F7F2`, charcoal, restrained brass, editorial serif, and clean sans-serif foundation unless the user asks for a new direction.
- Use generous whitespace, strong hierarchy, limited borders, and restrained motion. Avoid dashboard patterns, dense filters, oversized decoration, glass effects, and stacks of nested cards.
- Keep the main journey obvious: landing page → tower/floor directory → unit album → back to the same browsing context.
- Design mobile behavior deliberately rather than treating it as a compressed desktop layout.
- Maintain honest labels for placeholders and sample interiors. Never make decorative content look like verified property information.

## Working method

Translate the request into the user problem, affected screens, and a small set of design decisions. When the request leaves room for interpretation, choose the solution that improves photo discovery and viewing with the least added interface complexity.

Implement requested changes when code edits are in scope; do not stop at a critique or mockup. Reuse existing CSS variables and patterns before adding new ones. Keep JavaScript behavior separate from content data, and do not add a UI framework for an ordinary refinement.

Use image generation only when the user asks for new visual concepts or when a bitmap reference would materially clarify an unproven direction. Generated interiors must be labeled as concepts and must never replace or be presented as real unit photographs.

## Interaction and accessibility bar

Preserve semantic headings and landmarks, logical tab order, visible focus, descriptive accessible names, adequate contrast, comfortable touch targets, reduced-motion support, and gallery operation by keyboard and touch. Verify modal focus entry, Escape-to-close, and focus restoration whenever viewer behavior changes.

Avoid important controls that exist only on hover. Do not rely on color alone for state. Prevent layout shifts by keeping image dimensions or aspect ratios explicit.

## Visual verification

After a visual change, render the site and inspect the affected flow at approximately 390px and 1440px widths, plus an intermediate width when the layout changes materially. Check overflow, cropping, typography, spacing rhythm, active and focus states, loading/error behavior, and the quality of the transition between routes.

Use representative content: both tower directories, an album with four photos, an album with five or six photos, and a placeholder album when relevant. Compare screenshots before and after when a change is broad or subjective. Iterate on visible defects before reporting completion.

Run `npm test` and `npm run build` after implementation. Summarize the design rationale, files changed, viewports and flows inspected, and any remaining constraint.
