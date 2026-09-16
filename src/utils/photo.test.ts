import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { filterById } from '../filters/presets';
import { frameById } from '../frames/presets';
import { layoutById } from '../layouts/presets';
import { typographyById } from '../typography/presets';
import { compose } from './photo';

describe('compose footer typography', () => {
  const fillText = vi.fn();
  const fontLoad = vi.fn(async () => []);
  const context = {
    fillStyle: '',
    filter: '',
    font: '',
    textAlign: 'start' as CanvasTextAlign,
    fillRect: vi.fn(),
    fillText,
    save: vi.fn(),
    beginPath: vi.fn(),
    rect: vi.fn(),
    clip: vi.fn(),
    restore: vi.fn(),
  };
  const canvas = {
    width: 0,
    height: 0,
    getContext: vi.fn(() => context),
    toBlob: vi.fn((callback: BlobCallback) => callback(new Blob(['png']))),
  };

  beforeEach(() => {
    fillText.mockClear();
    fontLoad.mockClear();
    vi.stubGlobal('document', {
      fonts: { load: fontLoad },
      createElement: vi.fn(() => canvas),
    });
  });

  afterEach(() => vi.unstubAllGlobals());

  it('waits for the selected font subsets using every footer string that Canvas will render', async () => {
    await compose(
      [],
      frameById('black'),
      filterById('original'),
      {},
      true,
      '기억의 문장',
      new Date(2026, 8, 15),
      layoutById('classic'),
      typographyById('serif'),
      'center',
    );

    expect(fontLoad).toHaveBeenCalledWith('600 36px "Noto Serif KR"', '기억의 문장 2026.09.15 감성사진관');
    expect(fontLoad).toHaveBeenCalledWith('500 36px "Noto Serif KR"', '기억의 문장 2026.09.15 감성사진관');
  });

  it('draws message, date, and brand at the shared anchor without Canvas width-condensing', async () => {
    await compose(
      [],
      frameById('black'),
      filterById('original'),
      {},
      true,
      '기억의 문장',
      new Date(2026, 8, 15),
      layoutById('classic'),
      typographyById('serif'),
      'left',
    );

    expect(fillText.mock.calls.map(([text]) => text)).toEqual([
      '기억의 문장',
      '2026.09.15',
      '감성사진관',
    ]);
    expect(fillText.mock.calls.every(([, x]) => x === 96)).toBe(true);
    expect(fillText.mock.calls.every((call) => call.length === 3)).toBe(true);
  });

  it('uses the selected text-size scale when loading the export font', async () => {
    await compose(
      [],
      frameById('black'),
      filterById('original'),
      {},
      true,
      '기억의 문장',
      new Date(2026, 8, 15),
      layoutById('classic'),
      typographyById('serif'),
      'center',
      'large',
    );

    expect(fontLoad).toHaveBeenCalledWith(
      '600 40.800000000000004px "Noto Serif KR"',
      '기억의 문장 2026.09.15 감성사진관',
    );
  });
});
