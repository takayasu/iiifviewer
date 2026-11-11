import { useCallback, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { clampPageIndex, pageParamToIndex } from '../domain/viewer';

export const PAGE_PARAM = 'page';

export interface PageNavigation {
  readonly index: number;
  readonly total: number;
  readonly canPrev: boolean;
  readonly canNext: boolean;
  readonly goTo: (index: number) => void;
  readonly next: () => void;
  readonly prev: () => void;
}

type Resolve = (currentIndex: number) => number;

/**
 * Current page lives in the URL (?page=N, 1-based) so it is shareable and survives reloads.
 * Moves are resolved against the latest *requested* index (a ref), because React Router's
 * functional setSearchParams does not queue like setState — rapid key presses would otherwise
 * all start from the same stale index.
 */
export function usePageNavigation(total: number): PageNavigation {
  const [params, setParams] = useSearchParams();
  const index = pageParamToIndex(params.get(PAGE_PARAM), total);
  const latestIndex = useRef(index);

  useEffect(() => {
    latestIndex.current = index;
  }, [index]);

  const move = useCallback(
    (resolve: Resolve) => {
      const target = clampPageIndex(resolve(latestIndex.current), total);
      latestIndex.current = target;
      setParams(
        (current) => {
          const nextParams = new URLSearchParams(current);
          nextParams.set(PAGE_PARAM, String(target + 1));
          return nextParams;
        },
        { replace: true },
      );
    },
    [setParams, total],
  );

  const goTo = useCallback((target: number) => move(() => target), [move]);
  const next = useCallback(() => move((i) => i + 1), [move]);
  const prev = useCallback(() => move((i) => i - 1), [move]);

  return { index, total, canPrev: index > 0, canNext: index < total - 1, goTo, next, prev };
}
