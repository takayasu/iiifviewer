import type { ManifestEntry } from './types';

/** Case-insensitive match on title, provider, description and tags. */
export function filterEntries(entries: readonly ManifestEntry[], query: string): readonly ManifestEntry[] {
  const needle = query.trim().toLowerCase();
  if (needle === '') return entries;
  return entries.filter((entry) =>
    [entry.title, entry.provider, entry.description ?? '', ...entry.tags].some((field) =>
      field.toLowerCase().includes(needle),
    ),
  );
}
