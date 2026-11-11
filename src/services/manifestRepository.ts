import { normalizeManifest } from '../domain/manifest';
import type { NormalizedManifest } from '../domain/types';
import { isHttpUrl } from '../domain/url';
import { FetchError, fetchJson } from './http';

export async function loadManifest(url: string, signal?: AbortSignal): Promise<NormalizedManifest> {
  if (!isHttpUrl(url)) throw new FetchError('マニフェスト URL は http(s) で指定してください');
  return normalizeManifest(await fetchJson(url, signal));
}
