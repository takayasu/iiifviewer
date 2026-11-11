import { viewStateFromUnknown, type CatalogViewState } from '../domain/catalogViewState';

export const VIEW_STATE_STORAGE_KEY = 'dviewer.catalogViewState.v1';

/** Storage may be unavailable (private mode, blocked cookies); persistence is best-effort. */
export function loadViewState(): CatalogViewState | undefined {
  try {
    const raw = window.localStorage.getItem(VIEW_STATE_STORAGE_KEY);
    return raw ? viewStateFromUnknown(JSON.parse(raw)) : undefined;
  } catch {
    return undefined;
  }
}

export function saveViewState(state: CatalogViewState): void {
  try {
    window.localStorage.setItem(VIEW_STATE_STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Ignore: the URL still carries the state for this session.
  }
}
