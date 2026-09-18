import { describe, expect, it } from 'vitest';
import { isIosSafari, isStandaloneDisplay } from './PwaInstallPrompt';

describe('PwaInstallPrompt environment detection', () => {
  it('detects browser and iOS standalone modes', () => {
    expect(isStandaloneDisplay(true, false)).toBe(true);
    expect(isStandaloneDisplay(false, true)).toBe(true);
    expect(isStandaloneDisplay(false, false)).toBe(false);
  });

  it('shows iOS guidance only in Safari', () => {
    const safari = 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Version/18.0 Mobile/15E148 Safari/604.1';
    const chrome = 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 CriOS/128.0 Mobile/15E148 Safari/604.1';

    expect(isIosSafari(safari, 'iPhone', 5)).toBe(true);
    expect(isIosSafari(chrome, 'iPhone', 5)).toBe(false);
  });

  it('detects iPadOS desktop-style user agents', () => {
    const safari = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15) AppleWebKit/605.1.15 Version/18.0 Safari/605.1.15';

    expect(isIosSafari(safari, 'MacIntel', 5)).toBe(true);
    expect(isIosSafari(safari, 'MacIntel', 0)).toBe(false);
  });
});
