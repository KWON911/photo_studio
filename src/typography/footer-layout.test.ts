import { describe, expect, it } from 'vitest';
import { layoutById } from '../layouts/presets';
import { defaultTextSize, type TextAlignment } from '../types/photo';
import { getFooterTextLayout } from './footer-layout';
import { typographyById } from './presets';

const classic = layoutById('classic');

const options = (
  alignment: TextAlignment,
  overrides: Partial<Parameters<typeof getFooterTextLayout>[0]> = {},
) => ({
  layout: classic,
  typography: typographyById('modern'),
  alignment,
  hasMessage: true,
  hasDate: true,
  outputWidth: 1200,
  textSize: defaultTextSize,
  ...overrides,
});

describe('getFooterTextLayout', () => {
  it('uses medium as the default text size', () => {
    expect(defaultTextSize).toBe('medium');
  });

  it('uses the medium layout scale when text size is omitted', () => {
    const footer = getFooterTextLayout({
      layout: classic,
      typography: typographyById('modern'),
      alignment: 'center',
      hasMessage: true,
      hasDate: true,
      outputWidth: 1000,
    });

    expect(footer.messageSize).toBe(30);
  });

  it.each([
    ['small', 26],
    ['medium', 30],
    ['large', 34],
  ] as const)('scales %s text from the output width', (textSize, expected) => {
    const footer = getFooterTextLayout({
      ...options('center'),
      outputWidth: 1000,
      textSize,
    });

    expect(footer.messageSize).toBe(expected);
    expect(footer.dateSize).toBeLessThan(footer.messageSize);
  });

  it.each(['small', 'medium', 'large'] as const)(
    'keeps %s text inside the physical footer',
    (textSize) => {
      const footer = getFooterTextLayout({
        ...options('center'),
        outputWidth: 1000,
        textSize,
      });
      const outputHeight = 1000 / classic.previewAspectRatio;
      const footerTop = classic.footerY * outputHeight;
      const footerBottom = footerTop + classic.footerHeight * outputHeight;

      expect(footer.messageY - footer.messageSize).toBeGreaterThanOrEqual(footerTop);
      expect(footer.brandY).toBeLessThanOrEqual(footerBottom);
    },
  );

  it.each([
    ['left', 'left'],
    ['center', 'center'],
    ['right', 'right'],
  ] as const)('keeps the %s anchor on the padded content boundary', (alignment, canvasAlign) => {
    const footer = getFooterTextLayout(options(alignment));

    expect(footer.canvasAlign).toBe(canvasAlign);
    expect(footer.contentLeft).toBeGreaterThan(0);
    expect(footer.contentRight).toBeLessThan(1200);
    expect(footer.anchorX).toBe(
      alignment === 'left'
        ? footer.contentLeft
        : alignment === 'right'
          ? footer.contentRight
          : 600,
    );
  });

  it('keeps every visible line inside the physical footer', () => {
    const footer = getFooterTextLayout(options('center'));
    const footerTop = classic.footerY * classic.outputHeight;
    const footerBottom = footerTop + classic.footerHeight * classic.outputHeight;

    expect(footer.messageY - footer.messageSize).toBeGreaterThanOrEqual(footerTop);
    expect(footer.brandY).toBeLessThanOrEqual(footerBottom);
  });

  it('places message, date, and brand on distinct descending lines', () => {
    const footer = getFooterTextLayout(options('center'));

    expect(footer.messageSize).toBeGreaterThan(footer.dateSize);
    expect(footer.dateSize).toBeGreaterThan(footer.brandSize);
    expect(footer.messageY).toBeLessThan(footer.dateY);
    expect(footer.dateY).toBeLessThan(footer.brandY);
    expect(footer.dateY - footer.messageY).toBeGreaterThan(footer.dateSize);
    expect(footer.brandY - footer.dateY).toBeGreaterThan(footer.brandSize);
  });

  it('recenters the remaining lines when optional message or date is absent', () => {
    const allLines = getFooterTextLayout(options('center'));
    const brandOnly = getFooterTextLayout(
      options('center', { hasMessage: false, hasDate: false }),
    );
    const footerCenter =
      (classic.footerY + classic.footerHeight / 2) * classic.outputHeight;

    expect(brandOnly.brandY).toBeLessThan(allLines.brandY);
    expect(brandOnly.brandY - brandOnly.brandSize * 0.22).toBeCloseTo(footerCenter, 5);
  });

  it('scales type and horizontal bounds with the requested output width', () => {
    const regular = getFooterTextLayout(options('center'));
    const double = getFooterTextLayout(options('center', { outputWidth: 2400 }));

    expect(double.contentLeft).toBeCloseTo(regular.contentLeft * 2, 5);
    expect(double.contentRight).toBeCloseTo(regular.contentRight * 2, 5);
    expect(double.messageSize).toBeCloseTo(regular.messageSize * 2, 5);
    expect(double.dateSize).toBeCloseTo(regular.dateSize * 2, 5);
    expect(double.brandSize).toBeCloseTo(regular.brandSize * 2, 5);
  });
});
