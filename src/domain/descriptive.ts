import { asArray, asRecord, getId } from './iiifImage';
import { toText } from './language';
import type { DescriptiveInfo, IiifVersion, MetadataEntry, ResourceLink, ResourceLinkKind } from './types';
import { isHttpUrl } from './url';

type Json = Record<string, unknown>;

/** Property names per Presentation API version for the shared descriptive fields. */
const FIELDS: Readonly<Record<IiifVersion, { summary: string; rights: string; homepage: string }>> = {
  2: { summary: 'description', rights: 'license', homepage: 'related' },
  3: { summary: 'summary', rights: 'rights', homepage: 'homepage' },
};

const LINK_KINDS: readonly ResourceLinkKind[] = ['homepage', 'seeAlso', 'rendering'];

export function toMetadata(items: unknown): MetadataEntry[] {
  return asArray(items)
    .map(asRecord)
    .filter((item): item is Json => item !== undefined)
    .map((item) => ({ label: toText(item.label), value: toText(item.value) }))
    .filter((entry) => entry.label !== '' || entry.value !== '');
}

function optionalText(value: unknown): string | undefined {
  return toText(value) || undefined;
}

function toLink(kind: ResourceLinkKind, raw: unknown): ResourceLink | undefined {
  const url = getId(raw);
  if (!isHttpUrl(url)) return undefined;
  const record = asRecord(raw);
  const format = typeof record?.format === 'string' ? record.format : undefined;
  return { kind, label: toText(record?.label) || url, url, format };
}

function toLinks(resource: Json, version: IiifVersion): ResourceLink[] {
  return LINK_KINDS.flatMap((kind) => {
    const key = kind === 'homepage' ? FIELDS[version].homepage : kind;
    return asArray(resource[key])
      .map((raw) => toLink(kind, raw))
      .filter((link): link is ResourceLink => link !== undefined);
  });
}

function rightsOf(value: unknown): string | undefined {
  if (typeof value === 'string') return value || undefined;
  return getId(asArray(value)[0]);
}

function attributionOf(resource: Json, version: IiifVersion): string | undefined {
  return version === 3 ? optionalText(asRecord(resource.requiredStatement)?.value) : optionalText(resource.attribution);
}

/** Extract the descriptive properties common to Manifests and Canvases. */
export function readDescriptive(resource: Json, version: IiifVersion): DescriptiveInfo {
  const fields = FIELDS[version];
  return {
    summary: optionalText(resource[fields.summary]),
    attribution: attributionOf(resource, version),
    rights: rightsOf(resource[fields.rights]),
    navDate: typeof resource.navDate === 'string' ? resource.navDate : undefined,
    metadata: toMetadata(resource.metadata),
    links: toLinks(resource, version),
  };
}
