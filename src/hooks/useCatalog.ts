import type { CatalogParseResult } from '../domain/catalogCsv';
import { CATALOG_CSV_PATH, loadCatalog } from '../services/catalogRepository';
import { useAsyncResource, type AsyncState } from './useAsyncResource';

const loader = (path: string, signal: AbortSignal): Promise<CatalogParseResult> => loadCatalog(signal, path);

export function useCatalog(path: string = CATALOG_CSV_PATH): AsyncState<CatalogParseResult> {
  return useAsyncResource(path, loader);
}
