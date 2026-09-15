import { describe, expect, it } from 'vitest';
import { captureProgress, nextCaptureFeedback } from './capture-feedback';

describe('capture feedback', () => {
  it('moves from idle to flash to captured', () => {
    expect(nextCaptureFeedback('idle')).toBe('flash');
    expect(nextCaptureFeedback('flash')).toBe('captured');
    expect(nextCaptureFeedback('captured')).toBe('idle');
  });

  it('formats the third capture as 03 / 08', () => {
    expect(captureProgress(2)).toBe('03 / 08');
  });
});
