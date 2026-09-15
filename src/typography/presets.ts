import type { TypographyId, TypographyPreset } from '../types/photo';

export type { TypographyId, TypographyPreset } from '../types/photo';

const koreanFallback = '"Apple SD Gothic Neo", "Malgun Gothic", sans-serif';

export const typography: TypographyPreset[] = [
  { id: 'modern', name: '모던', fontName: 'Noto Sans KR', fontFamily: `"Noto Sans KR", ${koreanFallback}`, fallbackFontFamily: koreanFallback, messageWeight: 700, dateWeight: 500, letterSpacing: 0 },
  { id: 'serif', name: '세리프', fontName: 'Noto Serif KR', fontFamily: `"Noto Serif KR", "Apple SD Gothic Neo", "Malgun Gothic", serif, sans-serif`, fallbackFontFamily: `"Apple SD Gothic Neo", "Malgun Gothic", serif, sans-serif`, messageWeight: 600, dateWeight: 500, letterSpacing: 0.01 },
  { id: 'handwriting', name: '손글씨', fontName: 'Nanum Brush Script', fontFamily: `"Nanum Brush Script", ${koreanFallback}`, fallbackFontFamily: koreanFallback, messageWeight: 400, dateWeight: 400, letterSpacing: 0.02 },
  { id: 'soft', name: '소프트', fontName: 'Gowun Dodum', fontFamily: `"Gowun Dodum", ${koreanFallback}`, fallbackFontFamily: koreanFallback, messageWeight: 400, dateWeight: 400, letterSpacing: 0.01 },
];

export const defaultTypographyId: TypographyId = 'modern';

export const typographyById = (id: TypographyId): TypographyPreset =>
  typography.find((preset) => preset.id === id) ?? typography[0];

export async function ensureTypographyLoaded(
  preset: TypographyPreset,
  sizePx: number,
  text = '가',
): Promise<string> {
  if (typeof document === 'undefined' || !document.fonts) return preset.fallbackFontFamily;

  try {
    const fontSize = `${Math.max(1, sizePx)}px "${preset.fontName}"`;
    await Promise.all(
      [...new Set([preset.messageWeight, preset.dateWeight])].map((weight) =>
        document.fonts.load(`${weight} ${fontSize}`, text || '가'),
      ),
    );
    return preset.fontFamily;
  } catch {
    return preset.fallbackFontFamily;
  }
}
