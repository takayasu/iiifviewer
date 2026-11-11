export const PAGE_SIZE_OPTIONS: readonly number[] = [12, 24, 48];
export const DEFAULT_PAGE_SIZE = 12;

export interface PageSlice<T> {
  readonly items: readonly T[];
  /** 1-based, clamped into [1, totalPages]. */
  readonly page: number;
  readonly totalPages: number;
  readonly total: number;
  /** 1-based index of the first item on the page (0 when empty). */
  readonly from: number;
  /** 1-based index of the last item on the page (0 when empty). */
  readonly to: number;
}

export function totalPagesOf(total: number, pageSize: number): number {
  return Math.max(1, Math.ceil(total / Math.max(1, pageSize)));
}

export function paginate<T>(items: readonly T[], page: number, pageSize: number): PageSlice<T> {
  const size = Math.max(1, Math.trunc(pageSize));
  const totalPages = totalPagesOf(items.length, size);
  const current = Math.min(Math.max(1, Math.trunc(page) || 1), totalPages);
  const start = (current - 1) * size;
  const slice = items.slice(start, start + size);
  return {
    items: slice,
    page: current,
    totalPages,
    total: items.length,
    from: slice.length > 0 ? start + 1 : 0,
    to: start + slice.length,
  };
}

export type PageToken = number | 'ellipsis-start' | 'ellipsis-end';

const SIBLINGS = 1;

/** Page buttons to show, e.g. [1, '…', 4, 5, 6, '…', 10]. */
export function pageTokens(current: number, totalPages: number): readonly PageToken[] {
  const windowStart = Math.max(2, current - SIBLINGS);
  const windowEnd = Math.min(totalPages - 1, current + SIBLINGS);
  const middle = Array.from({ length: Math.max(0, windowEnd - windowStart + 1) }, (_, i) => windowStart + i);
  const tokens: PageToken[] = [1];
  if (windowStart > 2) tokens.push(windowStart === 3 ? 2 : 'ellipsis-start');
  tokens.push(...middle);
  if (windowEnd < totalPages - 1) tokens.push(windowEnd === totalPages - 2 ? totalPages - 1 : 'ellipsis-end');
  if (totalPages > 1) tokens.push(totalPages);
  return tokens;
}
