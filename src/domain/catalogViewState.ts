import { DEFAULT_PAGE_SIZE, PAGE_SIZE_OPTIONS } from './pagination';

export type CatalogViewMode = 'card' | 'table';

/** Everything the catalogue page needs to come back exactly as the user left it. */
export interface CatalogViewState {
  readonly view: CatalogViewMode;
  /** 1-based. */
  readonly page: number;
  readonly pageSize: number;
  readonly query: string;
}

export const DEFAULT_CATALOG_VIEW_STATE: CatalogViewState = {
  view: 'card',
  page: 1,
  pageSize: DEFAULT_PAGE_SIZE,
  query: '',
};

const PARAM = { view: 'view', page: 'page', pageSize: 'size', query: 'q' } as const;
const MAX_QUERY_LENGTH = 200;

function toView(value: unknown): CatalogViewMode {
  return value === 'table' ? 'table' : 'card';
}

function toPage(value: unknown): number {
  const page = typeof value === 'number' ? value : Number.parseInt(String(value ?? ''), 10);
  return Number.isInteger(page) && page >= 1 ? page : 1;
}

function toPageSize(value: unknown): number {
  const size = typeof value === 'number' ? value : Number.parseInt(String(value ?? ''), 10);
  return PAGE_SIZE_OPTIONS.includes(size) ? size : DEFAULT_PAGE_SIZE;
}

function toQuery(value: unknown): string {
  return typeof value === 'string' ? value.slice(0, MAX_QUERY_LENGTH) : '';
}

export function hasViewParams(params: URLSearchParams): boolean {
  return Object.values(PARAM).some((key) => params.has(key));
}

export function viewStateFromParams(params: URLSearchParams): CatalogViewState {
  return {
    view: toView(params.get(PARAM.view)),
    page: toPage(params.get(PARAM.page)),
    pageSize: toPageSize(params.get(PARAM.pageSize)),
    query: toQuery(params.get(PARAM.query) ?? ''),
  };
}

/** Default values are omitted to keep URLs short; `view` is always written so restored state is explicit. */
export function viewStateToParams(state: CatalogViewState): URLSearchParams {
  const params = new URLSearchParams({ [PARAM.view]: state.view });
  if (state.page !== DEFAULT_CATALOG_VIEW_STATE.page) params.set(PARAM.page, String(state.page));
  if (state.pageSize !== DEFAULT_CATALOG_VIEW_STATE.pageSize) params.set(PARAM.pageSize, String(state.pageSize));
  if (state.query !== '') params.set(PARAM.query, state.query);
  return params;
}

/** Validate an untrusted stored value (e.g. JSON from localStorage). */
export function viewStateFromUnknown(value: unknown): CatalogViewState | undefined {
  if (typeof value !== 'object' || value === null) return undefined;
  const record = value as Record<string, unknown>;
  return {
    view: toView(record.view),
    page: toPage(record.page),
    pageSize: toPageSize(record.pageSize),
    query: toQuery(record.query),
  };
}
