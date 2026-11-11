import { act, renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { usePageNavigation } from './usePageNavigation';

function wrapper(route: string) {
  return ({ children }: { children: ReactNode }) => <MemoryRouter initialEntries={[route]}>{children}</MemoryRouter>;
}

describe('usePageNavigation', () => {
  it('reads the 1-based page param', () => {
    const { result } = renderHook(() => usePageNavigation(5), { wrapper: wrapper('/viewer?page=3') });
    expect(result.current).toMatchObject({ index: 2, canPrev: true, canNext: true });
  });

  it('moves and clamps within bounds', () => {
    const { result } = renderHook(() => usePageNavigation(3), { wrapper: wrapper('/viewer') });
    expect(result.current.canPrev).toBe(false);
    act(() => result.current.next());
    expect(result.current.index).toBe(1);
    act(() => result.current.goTo(10));
    expect(result.current).toMatchObject({ index: 2, canNext: false });
    act(() => result.current.prev());
    expect(result.current.index).toBe(1);
  });
});

describe('usePageNavigation rapid moves', () => {
  it('applies consecutive moves within one tick against the latest state', () => {
    const { result } = renderHook(() => usePageNavigation(10), { wrapper: wrapper('/viewer?page=1') });
    const { next } = result.current;
    act(() => {
      next();
      next();
    });
    expect(result.current.index).toBe(2);
  });
});
