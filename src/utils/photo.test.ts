import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { filterById } from '../filters/presets';
import { frameById } from '../frames/presets';
import { layoutById } from '../layouts/presets';
import { typographyById } from '../typography/presets';
import { compose, name } from './photo';

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
    toBlob: vi.fn((callback: BlobCallback, type?: string) => callback(new Blob(['jpeg'], { type }))),
  };

  beforeEach(() => {
    fillText.mockClear();
    fontLoad.mockClear();
    canvas.toBlob.mockClear();
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

  it('creates the Grid export canvas at exactly 3304 by 4920 pixels', async () => {
    await compose(
      [],
      frameById('black'),
      filterById('original'),
      {},
      true,
      '기억의 문장',
      new Date(2026, 8, 15),
      layoutById('grid'),
      typographyById('serif'),
      'center',
    );

    expect(canvas.width).toBe(3304);
    expect(canvas.height).toBe(4920);
  });

  it('exports the composed result as a JPEG at quality 0.94', async () => {
    const blob = await compose(
      [], frameById('black'), filterById('original'), {}, true,
      '기억의 문장', new Date(2026, 8, 15), layoutById('classic'), typographyById('serif'), 'center',
    );

    expect(blob.type).toBe('image/jpeg');
    expect(canvas.toBlob).toHaveBeenCalledWith(expect.any(Function), 'image/jpeg', .94);
  });

  it('uses a jpg extension for downloaded results', () => {
    expect(name()).toMatch(/\.jpg$/);
  });
});
