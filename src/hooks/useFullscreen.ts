import { useCallback, useEffect, useState, type RefObject } from 'react';

export interface Fullscreen {
  readonly isFullscreen: boolean;
  readonly toggle: () => void;
}

/** Browser Fullscreen API bound to an element (keeps our toolbar visible in fullscreen). */
export function useFullscreen(target: RefObject<HTMLElement | null>): Fullscreen {
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const onChange = (): void => setIsFullscreen(document.fullscreenElement === target.current);
    document.addEventListener('fullscreenchange', onChange);
    return () => document.removeEventListener('fullscreenchange', onChange);
  }, [target]);

  const toggle = useCallback(() => {
    const element = target.current;
    if (!element) return;
    const action = document.fullscreenElement ? document.exitFullscreen() : element.requestFullscreen();
    action.catch(() => setIsFullscreen(false));
  }, [target]);

  return { isFullscreen, toggle };
}
