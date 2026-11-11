import type { NormalizedManifest } from '../domain/types';
import { loadManifest } from '../services/manifestRepository';
import { useAsyncResource, type AsyncState } from './useAsyncResource';

export function useManifest(url: string | undefined): AsyncState<NormalizedManifest> {
  return useAsyncResource(url, loadManifest, 'マニフェスト URL が指定されていません');
}
