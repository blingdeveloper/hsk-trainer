import { describe, expect, it } from 'vitest';
import { isAppleMobile } from '../../src/lib/install';

describe('isAppleMobile', () => {
  it('spots iPhones and iPads, including iPads that say they are Macs', () => {
    expect(isAppleMobile('Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Version/18.0 Mobile/15E148 Safari/604.1', 5)).toBe(true);
    expect(isAppleMobile('Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X) AppleWebKit/605.1.15', 5)).toBe(true);
    expect(isAppleMobile('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 Version/18.0 Safari/605.1.15', 5)).toBe(true);
  });

  it('leaves out Macs, Android and Windows', () => {
    expect(isAppleMobile('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/130 Safari/537.36', 0)).toBe(false);
    expect(isAppleMobile('Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 Chrome/130 Mobile Safari/537.36', 5)).toBe(false);
    expect(isAppleMobile('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/130 Safari/537.36', 0)).toBe(false);
  });
});
