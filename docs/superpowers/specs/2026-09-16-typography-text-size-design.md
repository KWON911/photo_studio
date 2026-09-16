# Typography Text Size Design

## Goal

Allow a user to choose a three-step footer message size while keeping the Preview and exported Canvas PNG visually identical.

## Scope

- Add `TextSize` with `small`, `medium`, and `large`; default to `medium`.
- Add an accessible `작게 / 기본 / 크게` button group to `TypographySelector`.
- Keep message and date tied to one size setting. The date and brand remain proportionally smaller than the message.
- Calculate every rendered size from `layout.outputWidth`, not a fixed pixel value.
- Carry the choice through Edit, Result, and returning to Edit. Reset only when starting a new capture.
- Use the same `getFooterTextLayout()` result in both `PhotoStrip` and Canvas composition.

## Layout Rules

The message scales by output width: small `0.026`, medium `0.030`, large `0.034`. Date and brand retain the existing ratios to the chosen message size. Existing footer line distribution and clipping continue to apply, so Classic, Grid, and Wide remain bounded by their individual footer dimensions.

## Data Flow

`App` owns `textSize`. It passes the value to `Edit`, `TypographySelector`, `PhotoStrip`, and `compose`. Both visual consumers pass it to `getFooterTextLayout()`, which exposes the resolved message, date, and brand sizes.

## Accessibility and Testing

Each size button uses `aria-pressed`. Tests cover the default, all three relative size calculations, and proof that Preview and Canvas derive their scale through the shared layout helper.
