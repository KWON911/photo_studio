import { describe, expect, it } from 'vitest';
import { frameById } from './presets';

describe('frameById', () => {
  it('returns the requested frame preset', () => {
    expect(frameById('black')).toMatchObject({ id: 'black', background: '#202020' });
  });
});
