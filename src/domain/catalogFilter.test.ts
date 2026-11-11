// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { filterEntries } from './catalogFilter';
import type { ManifestEntry } from './types';

const entries: ManifestEntry[] = [
  { id: '1', title: '和泉国絵図', provider: '国立国会図書館', manifestUrl: 'https://a', tags: ['地図'] },
  { id: '2', title: 'Book', provider: 'Wellcome', manifestUrl: 'https://b', tags: [], description: 'Genetics' },
];

describe('filterEntries', () => {
  it('returns all entries for a blank query', () => {
    expect(filterEntries(entries, '  ')).toBe(entries);
  });

  it.each([
    ['絵図', ['1']],
    ['wellcome', ['2']],
    ['GENETICS', ['2']],
    ['地図', ['1']],
    ['nothing', []],
  ])('matches "%s"', (query, ids) => {
    expect(filterEntries(entries, query).map((e) => e.id)).toEqual(ids);
  });
});
