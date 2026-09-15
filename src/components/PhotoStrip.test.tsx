import { createElement, type ComponentProps, type ComponentType } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { filterById } from '../filters/presets';
import { frameById } from '../frames/presets';
import { layoutById } from '../layouts/presets';
import { typographyById } from '../typography/presets';
import { PhotoStrip } from './PhotoStrip';

const preview = (showDate = true) => {
  const props = {
    photos: [],
    frame: frameById('black'),
    layout: layoutById('classic'),
    filter: filterById('original'),
    transforms: {},
    message: '기억의 문장',
    showDate,
    date: new Date(2026, 8, 15),
    typography: typographyById('serif'),
    alignment: 'right',
  } as ComponentProps<typeof PhotoStrip> & {
    typography: ReturnType<typeof typographyById>;
    alignment: 'right';
  };

  return renderToStaticMarkup(
    createElement(PhotoStrip as ComponentType<typeof props>, props),
  );
};

describe('PhotoStrip footer typography', () => {
  it('applies shared geometry variables with the selected family and alignment', () => {
    const markup = preview();

    expect(markup).toContain('--footer-message-size:');
    expect(markup).toContain('Noto Serif KR');
    expect(markup).toContain('text-align:right');
  });

  it('renders message, date, and brand as separate lines', () => {
    const markup = preview();

    expect(markup).toContain('class="strip-message"');
    expect(markup).toContain('class="strip-date"');
    expect(markup).toContain('class="strip-brand"');
    expect(markup).toContain('2026.09.15');
  });

  it('applies the same input-length limit as Canvas before the footer clips a long line', () => {
    const longMessage = '가'.repeat(40);
    const props = {
      photos: [],
      frame: frameById('black'),
      layout: layoutById('classic'),
      filter: filterById('original'),
      transforms: {},
      message: longMessage,
    } as ComponentProps<typeof PhotoStrip>;

    const markup = renderToStaticMarkup(
      createElement(PhotoStrip as ComponentType<typeof props>, props),
    );

    expect(markup).toContain('가'.repeat(30));
    expect(markup).not.toContain(longMessage);
  });
});
