import { renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useAsyncResource } from './useAsyncResource';

describe('useAsyncResource', () => {
  it('goes from loading to success', async () => {
    const loader = vi.fn(async (key: string) => `data:${key}`);
    const { result } = renderHook(() => useAsyncResource('a', loader));
    expect(result.current.status).toBe('loading');
    await waitFor(() => expect(result.current).toEqual({ status: 'success', data: 'data:a' }));
  });

  it('reports loader errors', async () => {
    const loader = vi.fn(async () => {
      throw new Error('boom');
    });
    const { result } = renderHook(() => useAsyncResource('a', loader));
    await waitFor(() => expect(result.current).toEqual({ status: 'error', error: 'boom' }));
  });

  it('returns an error immediately when the key is missing', () => {
    const loader = vi.fn(async () => 'x');
    const { result } = renderHook(() => useAsyncResource(undefined, loader, 'missing'));
    expect(result.current).toEqual({ status: 'error', error: 'missing' });
    expect(loader).not.toHaveBeenCalled();
  });

  it('never shows a stale result for a new key and aborts the old request', async () => {
    const signals: AbortSignal[] = [];
    const loader = vi.fn(async (key: string, signal: AbortSignal) => {
      signals.push(signal);
      return key;
    });
    const { result, rerender } = renderHook(({ k }) => useAsyncResource(k, loader), { initialProps: { k: 'a' } });
    await waitFor(() => expect(result.current).toEqual({ status: 'success', data: 'a' }));
    rerender({ k: 'b' });
    expect(result.current.status).toBe('loading');
    expect(signals[0].aborted).toBe(true);
    await waitFor(() => expect(result.current).toEqual({ status: 'success', data: 'b' }));
  });
});
