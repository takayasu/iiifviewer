import { useEffect, useState } from 'react';
import { errorMessage } from '../services/http';

export type AsyncState<T> =
  | { readonly status: 'loading' }
  | { readonly status: 'success'; readonly data: T }
  | { readonly status: 'error'; readonly error: string };

interface Settled<T> {
  readonly key: string;
  readonly state: AsyncState<T>;
}

const LOADING = { status: 'loading' } as const;

/**
 * Run an abortable loader whenever `key` changes.
 * Results are tagged with their key, so a stale result is never shown for a new key.
 * `key === undefined` means "nothing to load" and yields an error state.
 */
export function useAsyncResource<T>(
  key: string | undefined,
  loader: (key: string, signal: AbortSignal) => Promise<T>,
  missingKeyMessage = '読み込み対象が指定されていません',
): AsyncState<T> {
  const [settled, setSettled] = useState<Settled<T> | undefined>();

  useEffect(() => {
    if (key === undefined) return undefined;
    const controller = new AbortController();
    loader(key, controller.signal)
      .then((data) => setSettled({ key, state: { status: 'success', data } }))
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        setSettled({ key, state: { status: 'error', error: errorMessage(error) } });
      });
    return () => controller.abort();
  }, [key, loader]);

  if (key === undefined) return { status: 'error', error: missingKeyMessage };
  return settled?.key === key ? settled.state : LOADING;
}
