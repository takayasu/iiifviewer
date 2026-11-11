import { toText } from './language';
import { asArray, asNumber, asRecord, getId, pickThumbnail, toCanvasImage } from './iiifImage';
import type { CanvasPage, IiifVersion, MetadataEntry, NormalizedManifest } from './types';

export class ManifestFormatError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ManifestFormatError';
  }
}

type Json = Record<string, unknown>;

export function detectVersion(manifest: Json): IiifVersion {
  const context = JSON.stringify(manifest['@context'] ?? '');
  if (context.includes('presentation/3')) return 3;
  if (context.includes('presentation/2')) return 2;
  if (Array.isArray(manifest.sequences)) return 2;
  if (Array.isArray(manifest.items)) return 3;
  throw new ManifestFormatError('IIIF Presentation API のバージョンを判定できません');
}

function assertManifestType(manifest: Json): void {
  const type = String(manifest.type ?? manifest['@type'] ?? '');
  if (/collection/i.test(type)) {
    throw new ManifestFormatError('IIIF Collection は未対応です（Manifest の URL を指定してください）');
  }
}

function toMetadata(items: unknown): MetadataEntry[] {
  return asArray(items)
    .map(asRecord)
    .filter((item): item is Json => item !== undefined)
    .map((item) => ({ label: toText(item.label), value: toText(item.value) }))
    .filter((entry) => entry.label !== '' || entry.value !== '');
}

function pageLabel(label: unknown, index: number): string {
  return toText(label) || `${index + 1}`;
}

/* ---------- Presentation API v3 ---------- */

function firstPaintingBody(canvas: Json): unknown {
  const page = asRecord(asArray(canvas.items)[0]);
  const annotation = asRecord(asArray(page?.items)[0]);
  const body = asRecord(asArray(annotation?.body)[0]);
  return body?.type === 'Choice' ? asArray(body.items)[0] : body;
}

function v3Canvas(raw: unknown, index: number): CanvasPage | undefined {
  const canvas = asRecord(raw);
  const id = getId(canvas);
  if (!canvas || !id) return undefined;
  const image = toCanvasImage(firstPaintingBody(canvas));
  return {
    id,
    label: pageLabel(canvas.label, index),
    width: asNumber(canvas.width),
    height: asNumber(canvas.height),
    image,
    thumbnail: pickThumbnail(canvas.thumbnail, image),
  };
}

function normalizeV3(m: Json): NormalizedManifest {
  const statement = asRecord(m.requiredStatement);
  return {
    id: getId(m) ?? '',
    version: 3,
    label: toText(m.label) || '(無題)',
    summary: toText(m.summary) || undefined,
    attribution: toText(statement?.value) || undefined,
    rights: typeof m.rights === 'string' ? m.rights : undefined,
    metadata: toMetadata(m.metadata),
    canvases: asArray(m.items)
      .filter((item) => asRecord(item)?.type === 'Canvas')
      .map(v3Canvas)
      .filter((c): c is CanvasPage => c !== undefined),
  };
}

/* ---------- Presentation API v2 ---------- */

function v2Resource(canvas: Json): unknown {
  const resource = asRecord(asRecord(asArray(canvas.images)[0])?.resource);
  return resource?.['@type'] === 'oa:Choice' ? resource.default : resource;
}

function v2Canvas(raw: unknown, index: number): CanvasPage | undefined {
  const canvas = asRecord(raw);
  const id = getId(canvas);
  if (!canvas || !id) return undefined;
  const image = toCanvasImage(v2Resource(canvas));
  return {
    id,
    label: pageLabel(canvas.label, index),
    width: asNumber(canvas.width),
    height: asNumber(canvas.height),
    image,
    thumbnail: pickThumbnail(canvas.thumbnail, image),
  };
}

function normalizeV2(m: Json): NormalizedManifest {
  const sequence = asRecord(asArray(m.sequences)[0]);
  return {
    id: getId(m) ?? '',
    version: 2,
    label: toText(m.label) || '(無題)',
    summary: toText(m.description) || undefined,
    attribution: toText(m.attribution) || undefined,
    rights: typeof m.license === 'string' ? m.license : getId(asArray(m.license)[0]),
    metadata: toMetadata(m.metadata),
    canvases: asArray(sequence?.canvases)
      .map(v2Canvas)
      .filter((c): c is CanvasPage => c !== undefined),
  };
}

/** Normalize an untrusted JSON document into a viewer-ready manifest. */
export function normalizeManifest(json: unknown): NormalizedManifest {
  const manifest = asRecord(json);
  if (!manifest) throw new ManifestFormatError('マニフェストが JSON オブジェクトではありません');
  assertManifestType(manifest);
  const normalized = detectVersion(manifest) === 3 ? normalizeV3(manifest) : normalizeV2(manifest);
  if (normalized.canvases.length === 0) {
    throw new ManifestFormatError('表示可能なページ（Canvas）がありません');
  }
  return normalized;
}
