// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { stripHtml, toText } from './language';

describe('toText', () => {
  it('prefers Japanese in a v3 language map', () => {
    expect(toText({ en: ['Book'], ja: ['本'] })).toBe('本');
  });

  it('falls back to any available language', () => {
    expect(toText({ fr: ['Livre'] })).toBe('Livre');
  });

  it('uses "none" before arbitrary languages', () => {
    expect(toText({ de: ['Buch'], none: ['p. 1'] }, ['ja', 'none'])).toBe('p. 1');
  });

  it('joins multiple values', () => {
    expect(toText({ en: ['a', 'b'] })).toBe('a / b');
  });

  it('handles v2 strings, numbers and arrays', () => {
    expect(toText('title')).toBe('title');
    expect(toText(1700)).toBe('1700');
    expect(toText(['a', 'b'])).toBe('a / b');
  });

  it('selects the preferred language among v2 value objects', () => {
    const value = [
      { '@value': 'Map', '@language': 'en' },
      { '@value': '地図', '@language': 'ja' },
    ];
    expect(toText(value)).toBe('地図');
    expect(toText(value, ['en'])).toBe('Map');
  });

  it('keeps all value objects when no language matches', () => {
    expect(toText([{ '@value': 'x', '@language': 'fr' }, { '@value': 'y' }], ['ja'])).toBe('x / y');
  });

  it('returns empty string for unsupported input', () => {
    expect(toText(undefined)).toBe('');
    expect(toText(null)).toBe('');
    expect(toText({})).toBe('');
    expect(toText(true)).toBe('');
  });

  it('strips HTML from values', () => {
    expect(toText({ en: ['<p>Hello <b>world</b></p>'] })).toBe('Hello world');
  });
});

describe('stripHtml', () => {
  it('removes tags, decodes basic entities and collapses whitespace', () => {
    expect(stripHtml('<a href="x">A &amp; B</a>\n  &lt;c&gt;&nbsp;&quot;d&quot; &#39;e&#39;')).toBe(`A & B <c> "d" 'e'`);
  });

  it('does not insert spaces for inline tags (CJK) but separates block tags', () => {
    expect(stripHtml('<span>日</span>本')).toBe('日本');
    expect(stripHtml('<p>a</p><p>b</p>c<br/>d')).toBe('a b c d');
  });

  it('removes script tags without executing anything', () => {
    expect(stripHtml('<script>alert(1)</script>safe')).toBe('alert(1)safe');
  });
});
