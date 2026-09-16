import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { CaptureCountdownOverlay } from './CaptureCountdownOverlay';

describe('CaptureCountdownOverlay', () => {
  it('uses one non-interactive overlay for READY and countdown numbers', () => {
    const ready = renderToStaticMarkup(createElement(CaptureCountdownOverlay, { value: -1 }));
    const countdown = renderToStaticMarkup(createElement(CaptureCountdownOverlay, { value: 3 }));

    expect(ready).toContain('class="capture-countdown-overlay"');
    expect(ready).toContain('class="capture-countdown-text"');
    expect(ready).toContain('READY');
    expect(countdown).toContain('>3<');
  });
});
