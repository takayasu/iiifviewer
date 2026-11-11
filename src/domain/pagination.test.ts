// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { pageTokens, paginate, totalPagesOf } from './pagination';

const items = Array.from({ length: 32 }, (_, i) => i + 1);

describe('paginate', () => {
  it('returns the requested slice with 1-based bounds', () => {
    expect(paginate(items, 2, 12)).toMatchObject({ page: 2, totalPages: 3, total: 32, from: 13, to: 24 });
    expect(paginate(items, 3, 12).items).toEqual([25, 26, 27, 28, 29, 30, 31, 32]);
  });

  it('clamps out-of-range and invalid pages', () => {
    expect(paginate(items, 99, 12).page).toBe(3);
    expect(paginate(items, 0, 12).page).toBe(1);
    expect(paginate(items, Number.NaN, 12).page).toBe(1);
  });

  it('handles empty lists', () => {
    expect(paginate([], 1, 12)).toMatchObject({ items: [], page: 1, totalPages: 1, from: 0, to: 0 });
  });

  it('guards against non-positive page sizes', () => {
    expect(totalPagesOf(5, 0)).toBe(5);
  });
});

describe('pageTokens', () => {
  it.each([
    [1, 1, [1]],
    [1, 3, [1, 2, 3]],
    [1, 10, [1, 2, 'ellipsis-end', 10]],
    [5, 10, [1, 'ellipsis-start', 4, 5, 6, 'ellipsis-end', 10]],
    [10, 10, [1, 'ellipsis-start', 9, 10]],
    [3, 10, [1, 2, 3, 4, 'ellipsis-end', 10]],
    [8, 10, [1, 'ellipsis-start', 7, 8, 9, 10]],
  ])('page %s of %s', (current, total, expected) => {
    expect(pageTokens(current, total)).toEqual(expected);
  });
});
