# Typography and Capture Feedback Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add Korean web-font typography, shared footer alignment/layout, and unmistakable capture feedback without altering the existing photo workflow.

**Architecture:** Typography presets and footer geometry are pure modules consumed by both preview and Canvas. App state carries one typography id and one alignment value through Edit, Result, and reset. Capture feedback is a small pure state machine rendered above the video and never included in the captured video frame.

**Tech Stack:** React, TypeScript, Vite, Vitest, Canvas 2D, `@fontsource/*` Korean font packages.

## Global Constraints

- Use packaged open-license Korean fonts only; no CDN and only the required weights.
- Keep Canvas and CSS preview on the same font preset and footer geometry.
- Preserve camera, selection, crop, filters, frame, layout, export, share, and save behavior.
- Default typography is `modern`; default alignment is `center`; reset only for a new capture.
- Do not commit or push.

---

### Task 1: Typography presets and font readiness

**Files:**
- Create: `src/typography/presets.ts`
- Create: `src/typography/presets.test.ts`
- Modify: `src/types/photo.ts`
- Modify: `src/main.tsx`
- Modify: `package.json`

**Interfaces:**
- Produces `TypographyId`, `TypographyPreset`, `typographyById(id)`, `defaultTypographyId`, and `ensureTypographyLoaded(preset, sizePx): Promise<string>`.
- Consumers use the resolved font stack returned by `ensureTypographyLoaded` for Canvas and `preset.fontFamily` for CSS.

- [ ] **Step 1: Write the failing preset tests**

```ts
expect(typography).toHaveLength(4);
expect(defaultTypographyId).toBe('modern');
typography.forEach(preset => expect(preset.fontFamily).toContain('sans-serif'));
```

- [ ] **Step 2: Run `npm test -- src/typography/presets.test.ts` and verify the missing-module failure.**

- [ ] **Step 3: Install `@fontsource/noto-sans-kr`, `@fontsource/noto-serif-kr`, `@fontsource/nanum-brush-script`, and `@fontsource/gowun-dodum`; import only Modern 500/700, Serif 500/600, and 400 for Handwriting/Soft in `main.tsx`.**

- [ ] **Step 4: Add the typed preset table with explicit Korean-capable system fallback stacks and a font helper that uses `document.fonts.load()` when available, returning the fallback stack if loading rejects.**

- [ ] **Step 5: Run the preset test again and verify it passes.**

### Task 2: Shared footer text layout and Canvas composition

**Files:**
- Create: `src/typography/footer-layout.ts`
- Create: `src/typography/footer-layout.test.ts`
- Modify: `src/utils/photo.ts`
- Modify: `src/components/PhotoStrip.tsx`
- Modify: `src/edit.css`

**Interfaces:**
- Consumes `LayoutPreset`, `TypographyPreset`, `TextAlignment`, message/date presence, and output width.
- Produces `getFooterTextLayout(options)` with `contentLeft`, `contentRight`, `anchorX`, `canvasAlign`, `messageSize`, `dateSize`, `brandSize`, `messageY`, `dateY`, and `brandY`.

- [ ] **Step 1: Write failing geometry tests for left, center, and right anchors plus footer bounds and message/date vertical separation.**

```ts
expect(getFooterTextLayout(base('left')).anchorX).toBeGreaterThan(base('left').footerLeft);
expect(getFooterTextLayout(base('right')).anchorX).toBeLessThan(base('right').footerRight);
expect(getFooterTextLayout(base('center')).canvasAlign).toBe('center');
```

- [ ] **Step 2: Run `npm test -- src/typography/footer-layout.test.ts` and verify the missing-module failure.**

- [ ] **Step 3: Implement relative output-width font scaling, footer padding, alignment anchors, message/date spacing, and distinct message/date/brand type hierarchy.**

- [ ] **Step 4: Update `compose()` to await `ensureTypographyLoaded`, use `getFooterTextLayout()`, render message/date/brand as separate Canvas lines, and constrain text to the footer content width.**

- [ ] **Step 5: Update `PhotoStrip` to use the same helper-derived CSS variables, selected preset family/weights, alignment, and one-line overflow behavior.**

- [ ] **Step 6: Run the footer-layout tests and existing crop/result tests; verify all pass.**

### Task 3: Typography and alignment controls with state lifecycle

**Files:**
- Create: `src/components/TypographySelector.tsx`
- Create: `src/components/TypographySelector.test.ts`
- Modify: `src/App.tsx`
- Modify: `src/types/photo.ts`
- Modify: `src/edit.css`

**Interfaces:**
- `TypographySelector({ typography, alignment, onTypographyChange, onAlignmentChange })` emits typed ids only.
- App state passes typography/alignment to `PhotoStrip` and `compose`.

- [ ] **Step 1: Write a failing selector test that exposes four font buttons and three accessible alignment buttons.**

```ts
expect(typography.map(preset => preset.id)).toEqual(['modern','serif','handwriting','soft']);
expect(textAlignments).toEqual(['left','center','right']);
```

- [ ] **Step 2: Run `npm test -- src/components/TypographySelector.test.ts` and verify the missing-module failure.**

- [ ] **Step 3: Implement the compact selector and add typography/alignment state to App with Modern/center initial values. Place it below MESSAGE and above date control.**

- [ ] **Step 4: Pass the state through preview and Canvas composition; retain it for Result → Edit and reset it only in the new-capture action.**

- [ ] **Step 5: Run selector and full unit tests; verify defaults and typed options.**

### Task 4: Capture feedback state machine

**Files:**
- Create: `src/utils/capture-feedback.ts`
- Create: `src/utils/capture-feedback.test.ts`
- Modify: `src/App.tsx`
- Modify: `src/styles.css`
- Modify: `src/mobile-polish.css`

**Interfaces:**
- Produces `CaptureFeedback = 'idle' | 'flash' | 'captured'`, `nextCaptureFeedback()`, and `captureProgress(index): string`.
- Capture renders `.flash` and `.capture-confirmation` from this state.

- [ ] **Step 1: Write failing transition tests.**

```ts
expect(nextCaptureFeedback('idle')).toBe('flash');
expect(nextCaptureFeedback('flash')).toBe('captured');
expect(captureProgress(2)).toBe('03 / 08');
```

- [ ] **Step 2: Run `npm test -- src/utils/capture-feedback.test.ts` and verify the missing-module failure.**

- [ ] **Step 3: Implement pure transitions and update Capture so countdown clears, flash appears before `capture()`, `navigator.vibrate?.(12)` is attempted safely, progress advances immediately after capture, and the checkmark lasts 240ms.**

- [ ] **Step 4: Add a visible 160ms white overlay animation above the video, reduced-motion-safe styling, minimal checkmark feedback, and progress text.**

- [ ] **Step 5: Run capture-feedback and full tests; inspect Capture at 390×844 without granting camera permission.**

### Task 5: Full verification

**Files:**
- Modify only files required by fixes discovered during verification.

- [ ] **Step 1: Run `npm test` and verify every suite passes.**
- [ ] **Step 2: Run `npm run lint` and verify zero lint errors.**
- [ ] **Step 3: Run `npm run build` and verify the production build succeeds.**
- [ ] **Step 4: Inspect the 390×844 Edit layout for reachable completion CTA and no horizontal overflow; inspect Capture state presentation without camera permission.**
