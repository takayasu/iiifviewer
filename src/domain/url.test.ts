// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { isHttpUrl, toSafeUrl } from './url';

describe('isHttpUrl', () => {
  it.each(['https://example.org/a', 'http://localhost:5173/x'])('accepts %s', (url) => {
    expect(isHttpUrl(url)).toBe(true);
  });

  it.each(['javascript:alert(1)', 'data:text/html,hi', 'file:///etc/passwd', 'not a url', '', '   ', null, 42])(
    'rejects %s',
    (value) => {
      expect(isHttpUrl(value)).toBe(false);
    },
  );
});

describe('toSafeUrl', () => {
  it('returns the URL when safe and undefined otherwise', () => {
    expect(toSafeUrl('https://a.b/c')).toBe('https://a.b/c');
    expect(toSafeUrl('javascript:void(0)')).toBeUndefined();
  });
});
