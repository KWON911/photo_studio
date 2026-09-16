import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { renderToStaticMarkup } from 'react-dom/server';
// @ts-expect-error jsdom provides the test DOM at runtime but has no bundled declarations.
import { JSDOM } from 'jsdom';
import { describe, expect, it, vi } from 'vitest';
import { TypographySelector } from './TypographySelector';

const renderSelector = () => {
  const markup = renderToStaticMarkup(
    createElement(TypographySelector, {
      typography: 'serif',
      alignment: 'center',
      textSize: 'medium',
      onTypographyChange: vi.fn(),
      onAlignmentChange: vi.fn(),
      onTextSizeChange: vi.fn(),
    }),
  );

  return markup;
};

describe('TypographySelector', () => {
  it('shows exactly four visible typography choices in their own font', () => {
    const section = renderSelector().match(/class="typography-options"[\s\S]*?<\/div>/)?.[0] ?? '';
    const labels = [...section.matchAll(/<button[^>]*>([^<]+)<\/button>/g)].map((match) => match[1]);

    expect(labels).toEqual(['모던', '세리프', '손글씨', '소프트']);
    expect(labels).toHaveLength(4);
    expect(section).toContain('Noto Sans KR');
    expect(section).toContain('Noto Serif KR');
    expect(section).toContain('Nanum Brush Script');
    expect(section).toContain('Gowun Dodum');
  });

  it('exposes accessible left, center, and right alignment choices', () => {
    const section = renderSelector().match(/class="alignment-options"[\s\S]*?<\/div>/)?.[0] ?? '';
    const labels = [...section.matchAll(/aria-label="([^"]+)"/g)].map((match) => match[1]);
    const pressed = [...section.matchAll(/aria-pressed="([^"]+)"/g)].map((match) => match[1]);

    expect(labels).toEqual(['왼쪽 정렬', '가운데 정렬', '오른쪽 정렬']);
    expect(pressed).toEqual(['false', 'true', 'false']);
  });

  it('marks the current text size and reports a selected size', async () => {
    const dom = new JSDOM('<!doctype html><html><body><div id="root"></div></body></html>');
    const originalDocument = Object.getOwnPropertyDescriptor(globalThis, 'document');
    const originalWindow = Object.getOwnPropertyDescriptor(globalThis, 'window');
    Object.defineProperty(globalThis, 'document', { configurable: true, value: dom.window.document });
    Object.defineProperty(globalThis, 'window', { configurable: true, value: dom.window });
    const onTextSizeChange = vi.fn();
    const root = createRoot(dom.window.document.getElementById('root')!);

    try {
      await act(async () => {
        root.render(
          createElement(TypographySelector, {
            typography: 'serif',
            alignment: 'center',
            textSize: 'medium',
            onTypographyChange: vi.fn(),
            onAlignmentChange: vi.fn(),
            onTextSizeChange,
          }),
        );
      });

      const medium = [...dom.window.document.querySelectorAll('button')].find((button) => button.textContent === '기본');
      const large = [...dom.window.document.querySelectorAll('button')].find((button) => button.textContent === '크게');
      expect(medium?.getAttribute('aria-pressed')).toBe('true');
      expect(large).toBeDefined();

      await act(async () => {
        large?.click();
      });
      expect(onTextSizeChange).toHaveBeenCalledWith('large');
    } finally {
      await act(async () => root.unmount());
      if (originalDocument) Object.defineProperty(globalThis, 'document', originalDocument);
      if (originalWindow) Object.defineProperty(globalThis, 'window', originalWindow);
      dom.window.close();
    }
  });
});
