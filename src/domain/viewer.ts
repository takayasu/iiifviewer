import type { CanvasImage } from './types';

/** Tile source shape accepted by OpenSeadragon. */
export type TileSourceSpec = string | { readonly type: 'image'; readonly url: string };

/** IIIF image service → info.json (OSD auto-detects IIIF); otherwise a simple image. */
export function toTileSource(image: CanvasImage | undefined): TileSourceSpec | undefined {
  if (image?.service) return `${image.service.id}/info.json`;
  if (image?.url) return { type: 'image', url: image.url };
  return undefined;
}

/** Clamp a 0-based page index into [0, total-1]. Non-finite input falls back to 0. */
export function clampPageIndex(index: number, total: number): number {
  if (total <= 0 || !Number.isFinite(index)) return 0;
  return Math.min(Math.max(Math.trunc(index), 0), total - 1);
}

/** Parse a 1-based "page" query parameter into a 0-based index. */
export function pageParamToIndex(param: string | null, total: number): number {
  const page = Number.parseInt(param ?? '', 10);
  return clampPageIndex(Number.isNaN(page) ? 0 : page - 1, total);
}

export interface ImageRegion {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

export interface ImageSize {
  readonly width: number;
  readonly height: number;
}

export interface ViewportState {
  /** 100 = one image pixel per screen pixel. */
  readonly zoomPercent: number;
  readonly rotation: number;
  /** Visible part of the image, in source-image pixels (clipped to the image). */
  readonly region: ImageRegion;
  /** Actual pixel size of the opened image (from info.json / the loaded file). */
  readonly imageSize?: ImageSize;
}

export const INITIAL_VIEWPORT: ViewportState = {
  zoomPercent: 0,
  rotation: 0,
  region: { x: 0, y: 0, width: 0, height: 0 },
};

/** Intersect a viewport rectangle with the image bounds (empty margins excluded). */
export function clipRegion(region: ImageRegion, size: ImageSize): ImageRegion {
  const left = Math.max(0, region.x);
  const top = Math.max(0, region.y);
  const right = Math.min(size.width, region.x + region.width);
  const bottom = Math.min(size.height, region.y + region.height);
  if (right <= left || bottom <= top) return INITIAL_VIEWPORT.region;
  return { x: left, y: top, width: right - left, height: bottom - top };
}

export function formatZoom(percent: number): string {
  if (percent <= 0) return '—';
  return percent < 10 ? `${percent.toFixed(1)}%` : `${Math.round(percent)}%`;
}

export function formatRegion(region: ImageRegion): string {
  const r = (n: number): number => Math.max(0, Math.round(n));
  return `x:${r(region.x)} y:${r(region.y)} ${r(region.width)}×${r(region.height)}px`;
}
