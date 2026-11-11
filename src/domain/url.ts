const ALLOWED_PROTOCOLS: readonly string[] = ['http:', 'https:'];

/** Only http(s) URLs may be fetched or rendered (blocks javascript:, data:, file: …). */
export function isHttpUrl(value: unknown): value is string {
  if (typeof value !== 'string' || value.trim() === '') return false;
  try {
    return ALLOWED_PROTOCOLS.includes(new URL(value).protocol);
  } catch {
    return false;
  }
}

export function toSafeUrl(value: unknown): string | undefined {
  return isHttpUrl(value) ? value : undefined;
}
