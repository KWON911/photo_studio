import { describe, expect, it } from 'vitest';
import { canCaptureManually, defaultCaptureMode, isCaptureComplete, nextCaptureCount } from './capture-session';

describe('capture session', () => {
  it('defaults to automatic capture', () => {
    expect(defaultCaptureMode).toBe('auto');
  });

  it('allows one manual capture only while ready and not already capturing', () => {
    expect(canCaptureManually({ ready: true, capturing: false, count: 0 })).toBe(true);
    expect(canCaptureManually({ ready: false, capturing: false, count: 0 })).toBe(false);
    expect(canCaptureManually({ ready: true, capturing: true, count: 0 })).toBe(false);
  });

  it('increments one photo at a time and completes at eight', () => {
    expect(nextCaptureCount(0)).toBe(1);
    expect(nextCaptureCount(7)).toBe(8);
    expect(isCaptureComplete(8)).toBe(true);
  });
});
