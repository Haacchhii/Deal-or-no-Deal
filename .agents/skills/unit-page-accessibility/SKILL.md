---
name: unit-page-accessibility
description: Audit and improve accessibility in the Unit Page frontend, including semantics, keyboard navigation, focus management, contrast, motion, touch targets, and photo descriptions. Use for focused accessibility reviews or after interaction and layout changes; do not use for general visual redesign.
---

# Unit Page Accessibility

Review the affected visitor journey using rendered behavior and source inspection. Preserve the established visual direction while making the interface understandable and operable without a mouse.

## Review method

Read `AGENTS.md`, then inspect only the routes and components affected by the request unless a full-site audit is explicitly requested. Use automated checks when available, but confirm meaningful findings manually. Do not claim standards compliance from an automated score alone.

Test keyboard operation from the page start. Verify the skip link, landmark and heading structure, link and button semantics, focus visibility, logical tab order, control names, current/selected state, and the absence of keyboard traps.

For the gallery and full-screen viewer, verify arrow-key behavior when provided, focus entry, focus containment when appropriate, Escape-to-close, focus restoration to the invoking control, current-photo announcements, and usable previous/next controls. Confirm that touch targets remain practical at narrow widths.

Check text and control contrast, zoom/reflow behavior, reduced-motion handling, alternative text, iframe titles, decorative-image treatment, and status messages. Photo alt text should describe visible content without advertising claims; captions and labels must distinguish real photographs, samples, and placeholders.

## Findings and fixes

Report confirmed issues with route/component, reproduction method, user impact, severity, and a specific remediation. Prioritize blockers and misleading content over cosmetic improvements. Avoid changing factual copy or adding ARIA where native HTML already expresses the correct semantics.

When the user requests implementation, apply focused fixes, preserve existing interaction behavior outside scope, and retest the affected keyboard journey. Run `npm test` and `npm run build` after code changes.

Finish by stating what was tested manually, what was checked automatically, what was fixed, and what remains unverified.
