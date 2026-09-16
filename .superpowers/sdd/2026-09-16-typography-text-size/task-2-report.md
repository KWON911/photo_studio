# Task 2 report: accessible text-size selector and lifecycle

## Scope completed

- Added `작게`, `기본`, and `크게` text-size buttons to `TypographySelector`.
- The controls form an accessible labelled group and expose the active value with `aria-pressed`.
- Added typed `textSize` / `onTextSizeChange` selector props using the Task 1 `TextSize` model.
- Added application-owned `textSize` state initialized from `defaultTextSize`, forwarding it through `Edit` into the selector.
- The existing `새로 찍기` action resets text size to `medium`; returning from Result to Edit preserves it because the state remains in `App`.
- Reused the existing three-column alignment-control CSS grid for the three text-size controls, so no additional CSS rules were needed.

## TDD evidence

1. Added a DOM-level test asserting that `기본` is pressed for the medium value and clicking `크게` calls the real callback with `large`.
2. Ran `npm test -- src/components/TypographySelector.test.tsx` before implementation. It failed as expected because the `기본` control was absent (`expected undefined to be 'true'`).
3. Added the minimal selector, typed state forwarding, and reset behavior.
4. Re-ran the focused suite successfully: 1 file / 3 tests passed.

## Verification

- `npm test -- src/components/TypographySelector.test.tsx` — passed (1 file / 3 tests).
- `npm run build` — passed (`tsc -b && vite build`).
- `git diff --check` — passed with no whitespace errors.

## Scope note

Preview and Canvas forwarding are deliberately not included; Task 3 owns those consumers.
