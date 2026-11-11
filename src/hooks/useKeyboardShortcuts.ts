import { useEffect, useRef } from 'react';

export type ShortcutMap = Readonly<Record<string, () => void>>;

const EDITABLE_TAGS = new Set(['INPUT', 'TEXTAREA', 'SELECT']);

/** Elements inside `[data-shortcuts="off"]` keep native keys (e.g. scrolling a side panel). */
export const SHORTCUTS_OFF_ATTR = 'data-shortcuts';

function isIgnoredTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  return (
    EDITABLE_TAGS.has(target.tagName) || target.isContentEditable || target.closest(`[${SHORTCUTS_OFF_ATTR}="off"]`) !== null
  );
}

/** Global key handlers (KeyboardEvent.key → action), ignored while typing. */
export function useKeyboardShortcuts(shortcuts: ShortcutMap): void {
  const latest = useRef(shortcuts);
  useEffect(() => {
    latest.current = shortcuts;
  });

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.defaultPrevented || event.isComposing || event.ctrlKey || event.metaKey || event.altKey) return;
      if (isIgnoredTarget(event.target)) return;
      const action = latest.current[event.key];
      if (!action) return;
      event.preventDefault();
      action();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);
}
