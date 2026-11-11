// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { clampPageIndex, clipRegion, formatRegion, formatZoom, pageParamToIndex, toTileSource } from './viewer';

describe('toTileSource', () => {
  it('uses info.json for an image service', () => {
    expect(toTileSource({ service: { id: 'https://x.org/img', version: 2 }, url: 'https://x.org/a.jpg' })).toBe(
      'https://x.org/img/info.json',
    );
  });

  it('falls back to a simple image', () => {
    expect(toTileSource({ url: 'https://x.org/a.jpg' })).toEqual({ type: 'image', url: 'https://x.org/a.jpg' });
  });

  it('returns undefined when nothing is displayable', () => {
    expect(toTileSource(undefined)).toBeUndefined();
    expect(toTileSource({})).toBeUndefined();
  });
});

describe('page index helpers', () => {
  it.each([
    [-3, 10, 0],
    [4, 10, 4],
    [99, 10, 9],
    [2.7, 10, 2],
    [Number.NaN, 10, 0],
    [3, 0, 0],
  ])('clampPageIndex(%s, %s) = %s', (index, total, expected) => {
    expect(clampPageIndex(index, total)).toBe(expected);
  });

  it.each([
    ['1', 0],
    ['5', 4],
    ['500', 9],
    ['0', 0],
    ['abc', 0],
    [null, 0],
  ])('pageParamToIndex(%s) = %s', (param, expected) => {
    expect(pageParamToIndex(param, 10)).toBe(expected);
  });
});

describe('formatters', () => {
  it('formats zoom levels', () => {
    expect(formatZoom(0)).toBe('—');
    expect(formatZoom(5.234)).toBe('5.2%');
    expect(formatZoom(123.6)).toBe('124%');
  });

  it('formats regions with clamped, rounded pixels', () => {
    expect(formatRegion({ x: -10.2, y: 20.6, width: 300.4, height: 200.5 })).toBe('x:0 y:21 300×201px');
  });
});

describe('clipRegion', () => {
  const size = { width: 1000, height: 500 };

  it('removes empty margins around the image', () => {
    expect(clipRegion({ x: -200, y: -100, width: 1400, height: 700 }, size)).toEqual({ x: 0, y: 0, width: 1000, height: 500 });
  });

  it('keeps a region fully inside the image', () => {
    expect(clipRegion({ x: 100, y: 50, width: 200, height: 100 }, size)).toEqual({ x: 100, y: 50, width: 200, height: 100 });
  });

  it('returns an empty region when panned off the image', () => {
    expect(clipRegion({ x: 2000, y: 0, width: 100, height: 100 }, size)).toEqual({ x: 0, y: 0, width: 0, height: 0 });
  });
});
