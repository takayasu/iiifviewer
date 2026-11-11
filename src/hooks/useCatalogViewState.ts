import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  DEFAULT_CATALOG_VIEW_STATE,
  hasViewParams,
  viewStateFromParams,
  viewStateToParams,
  type CatalogViewState,
} from '../domain/catalogViewState';
import { loadViewState, saveViewState } from '../services/viewStateStorage';

export type CatalogViewStateUpdate = (patch: Partial<CatalogViewState>) => void;

/**
 * Catalogue view state (card/table, page, page size, query).
 * Source of truth is the URL (so browser Back restores it); it is mirrored to localStorage so that
 * plain links to "/" (header logo, "一覧へ戻る") also come back to the same state.
 */
export function useCatalogViewState(): readonly [CatalogViewState, CatalogViewStateUpdate] {
  const [params, setParams] = useSearchParams();
  const paramsKey = params.toString();

  const state = useMemo(() => {
    const current = new URLSearchParams(paramsKey);
    if (hasViewParams(current)) return viewStateFromParams(current);
    return loadViewState() ?? DEFAULT_CATALOG_VIEW_STATE;
  }, [paramsKey]);

  const update = useCallback<CatalogViewStateUpdate>(
    (patch) => {
      const next = { ...state, ...patch };
      saveViewState(next);
      setParams(viewStateToParams(next), { replace: true });
    },
    [state, setParams],
  );

  return [state, update] as const;
}
