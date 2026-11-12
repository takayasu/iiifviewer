import Papa from 'papaparse';
import type { IiifVersion, ManifestEntry } from './types';
import { isHttpUrl } from './url';

export interface CsvRowError {
  /** 1-based data row number (header excluded). */
  readonly row: number;
  readonly message: string;
}

export interface CatalogParseResult {
  readonly entries: readonly ManifestEntry[];
  readonly errors: readonly CsvRowError[];
}

const TAG_SEPARATOR = ';';
const REQUIRED_COLUMNS = ['title', 'manifestUrl'] as const;

type RawRow = Record<string, string | undefined>;

function clean(value: string | undefined): string {
  return (value ?? '').trim();
}

function parseVersion(value: string): IiifVersion | undefined {
  if (value === '2') return 2;
  if (value === '3') return 3;
  return undefined;
}

function parseTags(value: string): string[] {
  return value
    .split(TAG_SEPARATOR)
    .map((tag) => tag.trim())
    .filter((tag) => tag.length > 0);
}

/** A parsed row: the entry (if valid) plus any problems worth reporting. */
interface RowResult {
  readonly entry?: ManifestEntry;
  readonly errors: readonly CsvRowError[];
}

/** Optional column: an invalid value is dropped (and reported) without rejecting the row. */
function parseThumbnail(value: string, row: number): { url?: string; error?: CsvRowError } {
  if (!value) return {};
  if (isHttpUrl(value)) return { url: value };
  return { error: { row, message: `thumbnailUrl が不正です（サムネイルなしで表示）: "${value}"` } };
}

function toEntry(raw: RawRow, row: number): RowResult {
  const title = clean(raw.title);
  const manifestUrl = clean(raw.manifestUrl);
  if (!title) return { errors: [{ row, message: 'title が空です' }] };
  if (!isHttpUrl(manifestUrl)) return { errors: [{ row, message: `manifestUrl が不正です: "${manifestUrl}"` }] };

  const description = clean(raw.description);
  const thumbnail = parseThumbnail(clean(raw.thumbnailUrl), row);
  return {
    entry: {
      id: clean(raw.id) || `row-${row}`,
      title,
      provider: clean(raw.provider) || '不明',
      manifestUrl,
      iiifVersion: parseVersion(clean(raw.iiifVersion)),
      description: description || undefined,
      tags: parseTags(clean(raw.tags)),
      thumbnailUrl: thumbnail.url,
    },
    errors: thumbnail.error ? [thumbnail.error] : [],
  };
}

function dedupeById(entries: readonly ManifestEntry[]): { entries: ManifestEntry[]; duplicates: CsvRowError[] } {
  const seen = new Set<string>();
  const unique: ManifestEntry[] = [];
  const duplicates: CsvRowError[] = [];
  for (const entry of entries) {
    if (seen.has(entry.id)) {
      duplicates.push({ row: 0, message: `id が重複しています: "${entry.id}"（後の行を無視）` });
      continue;
    }
    seen.add(entry.id);
    unique.push(entry);
  }
  return { entries: unique, duplicates };
}

/** Parse and validate the catalogue CSV. Invalid rows are reported, not thrown. */
export function parseCatalogCsv(csvText: string): CatalogParseResult {
  const parsed = Papa.parse<RawRow>(csvText, { header: true, skipEmptyLines: 'greedy' });
  const fields = parsed.meta.fields ?? [];
  const missing = REQUIRED_COLUMNS.filter((column) => !fields.includes(column));
  if (missing.length > 0) {
    return { entries: [], errors: [{ row: 0, message: `必須列がありません: ${missing.join(', ')}` }] };
  }

  const parseErrors: CsvRowError[] = parsed.errors.map((e) => ({
    row: (e.row ?? -1) + 1,
    message: `CSV 構文エラー: ${e.message}`,
  }));
  const badRows = new Set(parseErrors.map((e) => e.row));
  const results = parsed.data.flatMap((raw, index) => (badRows.has(index + 1) ? [] : [toEntry(raw, index + 1)]));
  const { entries, duplicates } = dedupeById(
    results.flatMap((r) => (r.entry ? [r.entry] : [])),
  );
  return {
    entries,
    errors: [...parseErrors, ...results.flatMap((r) => r.errors), ...duplicates],
  };
}
