import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import { TypographySelector } from './TypographySelector';

const renderSelector = () => {
  const markup = renderToStaticMarkup(
    createElement(TypographySelector, {
      typography: 'serif',
      alignment: 'center',
      onTypographyChange: vi.fn(),
      onAlignmentChange: vi.fn(),
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
});
