---
name: unit-page-visual-qa
description: Inspect the rendered Unit Page website for responsive layout, visual regressions, broken interactions, and presentation defects. Use after frontend changes or when the user requests browser-based UI quality assurance; do not use for design ideation or catalog-only validation.
---

# Unit Page Visual QA

Verify what visitors actually see and can operate. Base findings on rendered evidence rather than CSS inspection alone.

## Scope the pass

Read `AGENTS.md` and identify the routes and components affected by the current change. Inspect the existing design direction only when needed to distinguish a defect from an intentional choice. Do not widen a focused review into a complete redesign.

Start the local Vite site or production preview and use browser inspection. When a before-change build or screenshot is available, compare it with the new rendering. Otherwise compare the result with the incumbent design tokens, component patterns, and route behavior.

## Representative coverage

For a broad frontend change, inspect approximately 390px, an intermediate tablet width, and 1440px. For a narrow change, inspect the affected breakpoint plus one adjacent breakpoint. Exercise the relevant set of:

- Landing page and primary navigation.
- Tower A and Tower B directories, including floor groups and empty states.
- A four-photo album and a five- or six-photo album.
- A placeholder or sample album and its truthful labeling.
- Gallery selection, previous/next controls, full-screen viewer, Escape, and return navigation.

Check initial load and one realistic interaction sequence rather than only static screenshots.

## What to inspect

Look for horizontal overflow, clipped or overlapping text, broken alignment, inconsistent spacing, unexpected wrapping, unstable image dimensions, poor crops, unreadable overlays, missing active/focus states, undersized controls, route-state loss, broken scrolling, modal defects, image failures, and console errors caused by the change.

Distinguish defects from subjective preferences. Report each actionable issue with its route, viewport, reproduction step, visible result, expected result, and severity. Avoid vague comments such as “make it cleaner.”

When implementation is requested, fix confirmed defects in one coherent batch, rerun the affected checks, and perform at most one confirmation pass unless a remaining failure justifies another. Run `npm test` and `npm run build` after code changes.

Finish with the viewports, routes, and interactions inspected; confirmed fixes; unresolved defects; and anything not tested.
