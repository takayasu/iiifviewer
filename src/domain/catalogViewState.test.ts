// @vitest-environment node
import { describe, expect, it } from 'vitest';
import {
  DEFAULT_CATALOG_VIEW_STATE,
  hasViewParams,
  viewStateFromParams,
  viewStateFromUnknown,
  viewStateToParams,
} from './catalogViewState';

describe('catalog view state <-> URL', () => {
  it('round-trips a full state', () => {
    const state = { view: 'table', page: 3, pageSize: 24, query: '錦絵' } as const;
    expect(viewStateFromParams(viewStateToParams(state))).toEqual(state);
  });

  it('omits defaults except the view', () => {
    expect(viewStateToParams(DEFAULT_CATALOG_VIEW_STATE).toString()).toBe('view=card');
  });

  it('sanitizes invalid values', () => {
    const params = new URLSearchParams('view=list&page=-2&size=7&q=' + 'x'.repeat(300));
    expect(viewStateFromParams(params)).toEqual({ view: 'card', page: 1, pageSize: 12, query: 'x'.repeat(200) });
  });

  it('detects whether the URL carries view state', () => {
    expect(hasViewParams(new URLSearchParams(''))).toBe(false);
    expect(hasViewParams(new URLSearchParams('q=a'))).toBe(true);
    expect(hasViewParams(new URLSearchParams('utm=1'))).toBe(false);
  });
});

describe('viewStateFromUnknown', () => {
  it('validates stored JSON', () => {
    expect(viewStateFromUnknown({ view: 'table', page: 2, pageSize: 48, query: 'a' })).toEqual({
      view: 'table',
      page: 2,
      pageSize: 48,
      query: 'a',
    });
    expect(viewStateFromUnknown({ view: 1, page: 'x', pageSize: 5, query: {} })).toEqual(DEFAULT_CATALOG_VIEW_STATE);
  });

  it('rejects non-objects', () => {
    expect(viewStateFromUnknown(null)).toBeUndefined();
    expect(viewStateFromUnknown('table')).toBeUndefined();
  });
});
