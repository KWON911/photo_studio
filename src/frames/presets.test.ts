import { describe, expect, it } from 'vitest';
import { frameById } from './presets';

describe('frameById', () => {
  it('returns the requested frame preset', () => {
    expect(frameById('black')).toMatchObject({ id: 'black', background: '#202020' });
  });
});

it('includes editorial photo booth frame presets', async () => {
  const { frames } = await import('./presets');
  expect(frames).toHaveLength(11);
  expect(frames.slice(0, 3).map((frame) => frame.decoration)).toEqual(['studio', 'film', 'archive']);
});
