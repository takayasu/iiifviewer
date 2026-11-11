import { fireEvent, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useKeyboardShortcuts } from './useKeyboardShortcuts';

describe('useKeyboardShortcuts', () => {
  it('invokes the mapped action', () => {
    const next = vi.fn();
    renderHook(() => useKeyboardShortcuts({ ArrowRight: next }));
    fireEvent.keyDown(window, { key: 'ArrowRight' });
    expect(next).toHaveBeenCalledOnce();
  });

  it('ignores events already handled and keys inside opt-out zones', () => {
    const next = vi.fn();
    renderHook(() => useKeyboardShortcuts({ ArrowRight: next }));
    const event = new KeyboardEvent('keydown', { key: 'ArrowRight', cancelable: true });
    event.preventDefault();
    window.dispatchEvent(event);
    const zone = document.createElement('div');
    zone.setAttribute('data-shortcuts', 'off');
    const inner = document.createElement('button');
    zone.append(inner);
    document.body.append(zone);
    fireEvent.keyDown(inner, { key: 'ArrowRight' });
    zone.remove();
    expect(next).not.toHaveBeenCalled();
  });

  it('ignores modifier combos and typing in inputs', () => {
    const next = vi.fn();
    renderHook(() => useKeyboardShortcuts({ f: next }));
    fireEvent.keyDown(window, { key: 'f', ctrlKey: true });
    const input = document.createElement('input');
    document.body.append(input);
    fireEvent.keyDown(input, { key: 'f' });
    input.remove();
    expect(next).not.toHaveBeenCalled();
  });
});
