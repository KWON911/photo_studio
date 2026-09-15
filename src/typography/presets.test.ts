import { describe, expect, it, vi } from 'vitest';
import { defaultTypographyId, ensureTypographyLoaded, typography, typographyById } from './presets';

describe('typography presets', () => {
  it('provides the four selectable Korean typography styles', () => {
    expect(typography.map((preset) => preset.id)).toEqual(['modern', 'serif', 'handwriting', 'soft']);
    expect(typography).toHaveLength(4);
  });

  it('defaults to Modern and resolves each typed id', () => {
    expect(defaultTypographyId).toBe('modern');
    expect(typographyById('serif')).toMatchObject({ id: 'serif', name: '세리프' });
  });

  it('keeps a Korean-capable generic fallback in every CSS font stack', () => {
    typography.forEach((preset) => {
      expect(preset.fontFamily).toContain('sans-serif');
      expect(preset.fallbackFontFamily).toContain('sans-serif');
    });
  });

  it('returns the stable fallback stack when the Font Loading API is unavailable', async () => {
    await expect(ensureTypographyLoaded(typographyById('modern'), 32)).resolves.toBe(
      typographyById('modern').fallbackFontFamily,
    );
  });

  it('returns the stable fallback stack when the Font Loading API rejects', async () => {
    vi.stubGlobal('document', { fonts: { load: () => Promise.reject(new Error('font unavailable')) } });

    try {
      await expect(ensureTypographyLoaded(typographyById('soft'), 24)).resolves.toBe(
        typographyById('soft').fallbackFontFamily,
      );
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it('loads each distinct Canvas weight with the actual Korean text needed by the Canvas', async () => {
    const load = vi.fn().mockResolvedValue([]);
    vi.stubGlobal('document', { fonts: { load } });

    try {
      await expect(ensureTypographyLoaded(typographyById('modern'), 32, '기억의 문장')).resolves.toBe(
        typographyById('modern').fontFamily,
      );
      expect(load).toHaveBeenCalledWith('700 32px "Noto Sans KR"', '기억의 문장');
      expect(load).toHaveBeenCalledWith('500 32px "Noto Sans KR"', '기억의 문장');
    } finally {
      vi.unstubAllGlobals();
    }
  });
});
