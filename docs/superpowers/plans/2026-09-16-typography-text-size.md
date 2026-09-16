# Typography Text Size Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a three-step footer text-size selector that renders at the same relative scale in the editor preview and Canvas PNG.

**Architecture:** `TextSize` is an application-owned union state. `getFooterTextLayout()` resolves all text dimensions from an output-width multiplier, and both `PhotoStrip` and `compose` consume that same layout result. `TypographySelector` owns the accessible visual control but receives state and callbacks from `App`.

**Tech Stack:** React, TypeScript, Vitest, Testing Library, Canvas 2D API, CSS container query units.

## Global Constraints

- Values are exactly `small`, `medium`, and `large`; `medium` is the default and reset value.
- No free-form slider; expose three buttons named `작게`, `기본`, and `크게` with `aria-pressed`.
- Message and date share one text-size state; date and brand remain smaller ratios of the message.
- Resolve sizes from `layout.outputWidth`, including Classic, Grid, and Wide.
- Preview and Canvas must use `getFooterTextLayout()` with identical `textSize`.
- Preserve selected value from Result back to Edit; reset it only in the New Capture action.

---

### Task 1: Shared text-size model and layout resolution

**Files:**
- Modify: `src/types/photo.ts`
- Modify: `src/typography/footer-layout.ts`
- Modify: `src/typography/footer-layout.test.ts`

**Interfaces:**
- Produces: `export type TextSize = 'small' | 'medium' | 'large'`
- Produces: `export const defaultTextSize: TextSize = 'medium'`
- Changes: `getFooterTextLayout(options)` accepts `textSize: TextSize`.

- [ ] **Step 1: Write the failing layout tests**

```ts
it('uses medium as the default text size', () => {
  expect(defaultTextSize).toBe('medium');
});

it.each([
  ['small', 26],
  ['medium', 30],
  ['large', 34],
] as const)('scales %s text from the output width', (textSize, expected) => {
  const footer = getFooterTextLayout({ ...options('center'), outputWidth: 1000, textSize });
  expect(footer.messageSize).toBe(expected);
  expect(footer.dateSize).toBeLessThan(footer.messageSize);
});
```

- [ ] **Step 2: Run the focused test to verify it fails**

Run: `npm test -- src/typography/footer-layout.test.ts`

Expected: FAIL because `TextSize`, `defaultTextSize`, and the `textSize` layout input do not exist.

- [ ] **Step 3: Implement the minimal shared model**

```ts
export type TextSize = 'small' | 'medium' | 'large';
export const defaultTextSize: TextSize = 'medium';
const messageScaleByTextSize: Record<TextSize, number> = {
  small: 0.026,
  medium: 0.03,
  large: 0.034,
};
const messageSize = outputWidth * messageScaleByTextSize[textSize];
```

Keep the existing date and brand multipliers and vertical line distribution.

- [ ] **Step 4: Run the focused test to verify it passes**

Run: `npm test -- src/typography/footer-layout.test.ts`

Expected: PASS; existing layout behavior remains green.

- [ ] **Step 5: Commit the shared layout change**

```bash
git add src/types/photo.ts src/typography/footer-layout.ts src/typography/footer-layout.test.ts
git commit -m "feat: add footer text size model"
```

### Task 2: Accessible selector and app-state lifecycle

**Files:**
- Modify: `src/components/TypographySelector.tsx`
- Modify: `src/components/TypographySelector.test.tsx`
- Modify: `src/App.tsx`
- Modify: `src/edit.css`

**Interfaces:**
- Consumes: `TextSize` and `defaultTextSize` from Task 1.
- Produces: `TypographySelector` props `textSize: TextSize` and `onTextSizeChange(size: TextSize): void`.

- [ ] **Step 1: Write the failing selector tests**

```tsx
render(<TypographySelector {...baseProps} textSize="medium" onTextSizeChange={onTextSizeChange} />);
expect(screen.getByRole('button', { name: '기본' })).toHaveAttribute('aria-pressed', 'true');
await user.click(screen.getByRole('button', { name: '크게' }));
expect(onTextSizeChange).toHaveBeenCalledWith('large');
```

- [ ] **Step 2: Run the focused test to verify it fails**

Run: `npm test -- src/components/TypographySelector.test.tsx`

Expected: FAIL because the text-size control and props do not exist.

- [ ] **Step 3: Implement state and accessible controls**

```tsx
const textSizes = [
  { id: 'small', label: '작게' },
  { id: 'medium', label: '기본' },
  { id: 'large', label: '크게' },
] as const;
```

Add the grouped buttons, use `aria-pressed={size.id === textSize}`, create App state with `useState(defaultTextSize)`, pass it through `Edit`, and reset it in the existing New Capture handler only.

- [ ] **Step 4: Run the focused test to verify it passes**

Run: `npm test -- src/components/TypographySelector.test.tsx`

Expected: PASS; typography and alignment tests remain green.

- [ ] **Step 5: Commit selector and lifecycle changes**

```bash
git add src/components/TypographySelector.tsx src/components/TypographySelector.test.tsx src/App.tsx src/edit.css
git commit -m "feat: add footer text size selector"
```

### Task 3: Preview and Canvas parity

**Files:**
- Modify: `src/components/PhotoStrip.tsx`
- Modify: `src/components/PhotoStrip.test.tsx`
- Modify: `src/utils/photo.ts`
- Modify: `src/utils/photo.test.ts`

**Interfaces:**
- Consumes: `textSize` and `getFooterTextLayout()` from Task 1.
- Requires: `PhotoStrip` and `compose` each pass the selected `textSize` into the shared helper.

- [ ] **Step 1: Write failing consumer tests**

```ts
it('uses the large shared text-size scale for Canvas text', async () => {
  await compose(...canvasArgs, layoutById('wide'), typographyById('modern'), 'center', 'large');
  expect(fillTextFontSizes()).toContain(34);
});
```

```tsx
it('renders the preview message with the shared large scale variable', () => {
  render(<PhotoStrip {...props} textSize="large" />);
  expect(screen.getByText('기억의 문장').parentElement).toHaveStyle('--footer-message-size: 3.4cqw');
});
```

- [ ] **Step 2: Run focused consumer tests to verify they fail**

Run: `npm test -- src/components/PhotoStrip.test.tsx src/utils/photo.test.ts`

Expected: FAIL because neither consumer accepts or forwards `textSize`.

- [ ] **Step 3: Forward the same state into both consumers**

```ts
const footer = getFooterTextLayout({
  layout,
  typography,
  alignment,
  textSize,
  hasMessage: Boolean(text),
  hasDate: showDate,
  outputWidth: canvas.width,
});
```

Give `PhotoStrip` a default of `defaultTextSize`, use the identical helper input, and pass the App state to both Preview and `compose`.

- [ ] **Step 4: Run focused consumer tests to verify they pass**

Run: `npm test -- src/components/PhotoStrip.test.tsx src/utils/photo.test.ts`

Expected: PASS; Canvas font sizes and Preview CSS variables match the selected output-width scale.

- [ ] **Step 5: Run the complete verification set**

Run: `npm test`

Run: `npm run lint`

Run: `npm run build`

Expected: all commands exit 0.

- [ ] **Step 6: Commit parity changes**

```bash
git add src/components/PhotoStrip.tsx src/components/PhotoStrip.test.tsx src/utils/photo.ts src/utils/photo.test.ts
git commit -m "feat: keep text size consistent in preview and canvas"
```
