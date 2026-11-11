/**
 * Convert IIIF label/value representations into display text.
 *
 * Supports:
 *  - v3 language maps: { "ja": ["..."], "en": ["..."], "none": ["..."] }
 *  - v2 plain strings, arrays, and JSON-LD value objects { "@value", "@language" }
 */

export const DEFAULT_LANGUAGES: readonly string[] = ['ja', 'en', 'none'];

const SEPARATOR = ' / ';
const BLOCK_TAG_PATTERN = /<\/?(p|br|div|li|ul|ol|h[1-6]|tr|td)\b[^>]*>/gi;
const TAG_PATTERN = /<[^>]*>/g;
const WHITESPACE_PATTERN = /\s+/g;

const ENTITY_MAP: Readonly<Record<string, string>> = {
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&#39;': "'",
  '&nbsp;': ' ',
};

/** IIIF allows a small HTML subset in values; we render plain text only. */
export function stripHtml(input: string): string {
  return input
    .replace(BLOCK_TAG_PATTERN, ' ')
    // Inline tags are removed without a space so CJK text like <span>日</span>本 stays "日本".
    .replace(TAG_PATTERN, '')
    .replace(/&(amp|lt|gt|quot|#39|nbsp);/g, (entity) => ENTITY_MAP[entity] ?? entity)
    .replace(WHITESPACE_PATTERN, ' ')
    .trim();
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function fromValueObject(value: Record<string, unknown>, languages: readonly string[]): string[] {
  const text = value['@value'];
  return typeof text === 'string' ? [text] : fromLanguageMap(value, languages);
}

function fromLanguageMap(map: Record<string, unknown>, languages: readonly string[]): string[] {
  const preferred = languages.find((lang) => Array.isArray(map[lang]) && (map[lang] as unknown[]).length > 0);
  const key = preferred ?? Object.keys(map).find((k) => Array.isArray(map[k]));
  if (!key) return [];
  return (map[key] as unknown[]).filter((v): v is string => typeof v === 'string');
}

/** Pick v2 value objects matching the preferred language, otherwise keep all. */
function fromArray(values: unknown[], languages: readonly string[]): string[] {
  const objects = values.filter(isRecord);
  const preferredLang = languages.find((lang) => objects.some((o) => o['@language'] === lang));
  const selected = preferredLang
    ? values.filter((v) => !isRecord(v) || v['@language'] === preferredLang)
    : values;
  return selected.flatMap((v) => collect(v, languages));
}

function collect(value: unknown, languages: readonly string[]): string[] {
  if (typeof value === 'string') return [value];
  if (typeof value === 'number') return [String(value)];
  if (Array.isArray(value)) return fromArray(value, languages);
  if (isRecord(value)) return fromValueObject(value, languages);
  return [];
}

export function toText(value: unknown, languages: readonly string[] = DEFAULT_LANGUAGES): string {
  return collect(value, languages)
    .map(stripHtml)
    .filter((text) => text.length > 0)
    .join(SEPARATOR);
}
