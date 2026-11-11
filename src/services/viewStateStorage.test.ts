import { afterEach, describe, expect, it, vi } from 'vitest';
import { loadViewState, saveViewState, VIEW_STATE_STORAGE_KEY } from './viewStateStorage';

describe('viewStateStorage', () => {
  afterEach(() => window.localStorage.clear());

  it('saves and loads state', () => {
    saveViewState({ view: 'table', page: 2, pageSize: 24, query: 'q' });
    expect(loadViewState()).toEqual({ view: 'table', page: 2, pageSize: 24, query: 'q' });
  });

  it('returns undefined for missing or corrupt data', () => {
    expect(loadViewState()).toBeUndefined();
    window.localStorage.setItem(VIEW_STATE_STORAGE_KEY, '{not json');
    expect(loadViewState()).toBeUndefined();
  });

  it('never throws when storage is unavailable', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('quota', 'QuotaExceededError');
    });
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new DOMException('denied', 'SecurityError');
    });
    expect(() => saveViewState({ view: 'card', page: 1, pageSize: 12, query: '' })).not.toThrow();
    expect(loadViewState()).toBeUndefined();
  });
});
