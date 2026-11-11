import { parseCatalogCsv, type CatalogParseResult } from '../domain/catalogCsv';
import { fetchText } from './http';

export const CATALOG_CSV_PATH = `${import.meta.env.BASE_URL}data/manifests.csv`;

/** Loads the local manifest catalogue CSV served from /public/data. */
export async function loadCatalog(signal?: AbortSignal, path: string = CATALOG_CSV_PATH): Promise<CatalogParseResult> {
  return parseCatalogCsv(await fetchText(path, signal));
}
