import type { CanvasImage, CanvasPage, DescriptiveInfo, NormalizedManifest, ResourceLink, ResourceLinkKind } from './types';
import { isHttpUrl } from './url';

/** One label/value line of the information pane; `href` makes the value a link. */
export interface PropertyRow {
  readonly label: string;
  readonly value: string;
  readonly href?: string;
}

const VIEWING_DIRECTIONS: Readonly<Record<string, string>> = {
  'left-to-right': '左から右',
  'right-to-left': '右から左',
  'top-to-bottom': '上から下',
  'bottom-to-top': '下から上',
};

const LINK_LABELS: Readonly<Record<ResourceLinkKind, string>> = {
  homepage: '公開ページ',
  seeAlso: '関連データ',
  rendering: 'ダウンロード',
};

const ISO_DATE = /^(\d{4}-\d{2}-\d{2})T/;
const numberFormat = new Intl.NumberFormat('ja-JP');

/** A text row; URL values become links. Empty values yield no row. */
function row(label: string, value: string | undefined): PropertyRow[] {
  if (!value) return [];
  return [isHttpUrl(value) ? { label, value, href: value } : { label, value }];
}

function plainRow(label: string, value: string | undefined): PropertyRow[] {
  return value ? [{ label, value }] : [];
}

function linkRow(link: ResourceLink): PropertyRow {
  const value = link.format ? `${link.label}（${link.format}）` : link.label;
  return { label: LINK_LABELS[link.kind], value, href: link.url };
}

function formatDate(navDate: string | undefined): string | undefined {
  return navDate?.match(ISO_DATE)?.[1] ?? navDate;
}

function formatSize(width: number | undefined, height: number | undefined): string | undefined {
  return width && height ? `${numberFormat.format(width)} × ${numberFormat.format(height)} px` : undefined;
}

function imageRow(image: CanvasImage | undefined): PropertyRow {
  if (image?.service) {
    return { label: '画像', value: `IIIF Image API v${image.service.version}`, href: `${image.service.id}/info.json` };
  }
  if (image?.url) return { label: '画像', value: '静的画像', href: image.url };
  return { label: '画像', value: '画像なし' };
}

/** Rights, date, free-form metadata and related links (shared by both sections). */
function descriptiveRows(info: DescriptiveInfo): PropertyRow[] {
  return [
    ...row('帰属表示', info.attribution),
    ...row('ライセンス', info.rights),
    ...plainRow('日付', formatDate(info.navDate)),
  ];
}

function tailRows(info: DescriptiveInfo): PropertyRow[] {
  return [...info.metadata.flatMap((entry) => row(entry.label, entry.value)), ...info.links.map(linkRow)];
}

/** Upper section: properties of the whole manifest. */
export function manifestRows(manifest: NormalizedManifest, manifestUrl: string): readonly PropertyRow[] {
  const direction = manifest.viewingDirection;
  return [
    ...row('タイトル', manifest.label),
    ...row('概要', manifest.summary),
    ...plainRow('提供機関', manifest.provider),
    ...descriptiveRows(manifest),
    ...plainRow('表示方向', direction ? (VIEWING_DIRECTIONS[direction] ?? direction) : undefined),
    ...plainRow('ページ数', String(manifest.canvases.length)),
    ...plainRow('目次（Range）', manifest.structureCount > 0 ? `${manifest.structureCount} 件` : undefined),
    ...tailRows(manifest),
    ...row('マニフェスト URL', manifestUrl),
  ];
}

/** Lower section: the canvas currently shown in the viewer. */
export function canvasRows(canvas: CanvasPage, index: number, total: number): readonly PropertyRow[] {
  return [
    { label: 'ページ', value: `${index + 1} / ${total}` },
    ...plainRow('ラベル', canvas.label),
    ...plainRow('サイズ', formatSize(canvas.width, canvas.height)),
    imageRow(canvas.image),
    ...row('概要', canvas.summary),
    ...descriptiveRows(canvas),
    ...tailRows(canvas),
    // Canvas IDs are identifiers, often not dereferenceable, so they are not linked.
    ...plainRow('Canvas ID', canvas.id),
  ];
}
