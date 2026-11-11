import type { CanvasImage, ImageService, IiifVersion } from './types';
import { isHttpUrl } from './url';

const THUMBNAIL_SIZE = '!200,200';

type Json = Record<string, unknown>;

export function asRecord(value: unknown): Json | undefined {
  return typeof value === 'object' && value !== null && !Array.isArray(value) ? (value as Json) : undefined;
}

export function asArray(value: unknown): unknown[] {
  if (Array.isArray(value)) return value;
  return value === undefined || value === null ? [] : [value];
}

export function getId(value: unknown): string | undefined {
  if (typeof value === 'string') return value;
  const record = asRecord(value);
  const id = record?.id ?? record?.['@id'];
  return typeof id === 'string' ? id : undefined;
}

export function asNumber(value: unknown): number | undefined {
  return typeof value === 'number' && Number.isFinite(value) && value > 0 ? value : undefined;
}

function serviceVersion(service: Json): IiifVersion | undefined {
  const type = String(service.type ?? service['@type'] ?? '');
  const context = JSON.stringify(service['@context'] ?? '');
  const profile = JSON.stringify(service.profile ?? '');
  if (type === 'ImageService3' || context.includes('image/3')) return 3;
  if (type === 'ImageService2' || context.includes('image/2') || profile.includes('image/2')) return 2;
  if (type.startsWith('ImageService') || profile.includes('level')) return 2;
  return undefined;
}

/** Find the first IIIF Image API service attached to a resource. */
export function findImageService(resource: unknown): ImageService | undefined {
  for (const candidate of asArray(asRecord(resource)?.service)) {
    const service = asRecord(candidate);
    const id = getId(service);
    const version = service ? serviceVersion(service) : undefined;
    if (service && version && isHttpUrl(id)) return { id: id.replace(/\/info\.json$/, '').replace(/\/+$/, ''), version };
  }
  return undefined;
}

const NON_IMAGE_TYPES = /^(dctypes:)?(Sound|Video|Audio|Text|Dataset|Model)$/i;

/** Reject A/V and other non-image bodies (they would fail inside the image viewer). */
function isImageResource(record: Json): boolean {
  const type = String(record.type ?? record['@type'] ?? '');
  const format = String(record.format ?? '');
  return !NON_IMAGE_TYPES.test(type) && !/^(audio|video)\//.test(format);
}

export function toCanvasImage(resource: unknown): CanvasImage | undefined {
  const record = asRecord(resource);
  if (!record || !isImageResource(record)) return undefined;
  const url = getId(record);
  const service = findImageService(record);
  if (!service && !isHttpUrl(url)) return undefined;
  return {
    url: isHttpUrl(url) ? url : undefined,
    service,
    width: asNumber(record.width),
    height: asNumber(record.height),
  };
}

/** Build an Image API thumbnail URL ("!w,h" is valid for both v2 and v3). */
export function serviceThumbnailUrl(service: ImageService, size: string = THUMBNAIL_SIZE): string {
  return `${service.id}/full/${size}/0/default.jpg`;
}

export function firstThumbnail(value: unknown): string | undefined {
  const id = getId(asArray(value)[0]);
  return isHttpUrl(id) ? id : undefined;
}

export function pickThumbnail(explicit: unknown, image: CanvasImage | undefined): string | undefined {
  return firstThumbnail(explicit) ?? (image?.service ? serviceThumbnailUrl(image.service) : image?.url);
}
