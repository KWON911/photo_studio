# Typography and capture feedback design

## Scope

Improve only the photo-strip footer typography and capture feedback. Preserve camera capture, selection, editing, filters, frames, layouts, export, sharing, and saving flows. Do not add frames, layouts, filters, uploads, server storage, authentication, or PWA behavior.

## Typography model

Add `TypographyId` (`modern`, `serif`, `handwriting`, `soft`) and `TextAlignment` (`left`, `center`, `right`) to the photo domain types. Create `src/typography/presets.ts` as the single source for display name, Canvas/CSS font family stack, message and date weights, and letter spacing.

Use only packaged, open-license Korean fonts with explicit system fallbacks:

- Modern: Noto Sans KR, 500/700
- Serif: Noto Serif KR, 500/600
- Handwriting: Nanum Brush Script, 400
- Soft: Gowun Dodum, 400

Import only those weights from the corresponding `@fontsource/*` npm packages. No CDN is used. A font-loading helper waits for `document.fonts.load()` before Canvas composition and falls back to each preset's system stack on failure.

Typography defaults are Modern and center. Result-to-edit preserves typography and alignment. Starting a new capture resets both defaults.

## Shared footer geometry

Create a pure footer layout helper that takes the layout, selected typography, alignment, message/date presence, and output width. It returns logical footer padding, message/date font sizes, line gap, baselines, and alignment anchor.

Message is the dominant line; date is smaller; frame label is smallest. Font sizes derive from output width, not a fixed global pixel size. Preview uses the same logical ratios with CSS custom properties; Canvas uses the same helper's physical values. Left and right anchors use footer padding, while center uses the footer midpoint. All text remains clipped to one line in the preview and constrained to the footer content width in Canvas.

## Edit UI

Keep typography controls inside the existing metadata area below MESSAGE:

1. Message input and count
2. Typography selector with four compact buttons rendered in their own font
3. Alignment selector with accessible left/center/right labels
4. Date toggle

Controls use existing low-radius, muted-border visual language. At 390×844 they wrap only between labelled rows, not within a control group, and retain a reachable completion CTA.

## Capture feedback

Use one capture-feedback state machine: `idle`, `flash`, `captured`. For every photo: remove countdown, show full-screen white flash before reading the video frame, perform capture while the overlay is only UI, request vibration when supported, advance progress immediately, show a minimal checkmark for 240ms, then continue the interval.

The flash has a short 160ms opacity animation and remains visible under reduced motion without scale effects. It is rendered in Capture, above the video but outside the source canvas path, so it cannot enter the captured image.

## Tests and verification

Add unit tests for four presets, Korean fallbacks, default typography/alignment, footer anchors and boundaries, message/date line layout, reset defaults, and pure capture-feedback transitions. Preserve all existing tests. Run `npm test`, `npm run lint`, and `npm run build`; inspect 390×844 Edit and Capture views.
