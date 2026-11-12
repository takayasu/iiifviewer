// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { v3Manifest } from '../test/fixtures';
import { normalizeManifest } from './manifest';
import { canvasRows, manifestRows } from './metadataRows';
import type { CanvasPage, NormalizedManifest } from './types';

const MANIFEST_URL = 'https://example.org/iiif/book/manifest';

function labels(rows: readonly { label: string }[]): string[] {
  return rows.map((row) => row.label);
}

describe('manifestRows', () => {
  const base = normalizeManifest(v3Manifest);

  it('lists manifest-wide properties in a stable order and skips empty ones', () => {
    expect(labels(manifestRows(base, MANIFEST_URL))).toEqual([
      'タイトル',
      '概要',
      '帰属表示',
      'ライセンス',
      'ページ数',
      'Author',
      'マニフェスト URL',
    ]);
  });

  it('links URL values and keeps text values plain', () => {
    const rows = manifestRows(base, MANIFEST_URL);
    expect(rows.find((r) => r.label === 'ライセンス')).toEqual({
      label: 'ライセンス',
      value: 'http://creativecommons.org/licenses/by/4.0/',
      href: 'http://creativecommons.org/licenses/by/4.0/',
    });
    expect(rows.find((r) => r.label === '帰属表示')?.href).toBeUndefined();
  });

  it('shows structural properties and related links', () => {
    const manifest: NormalizedManifest = {
      ...base,
      provider: 'Example Library',
      navDate: '1700-01-01T00:00:00Z',
      viewingDirection: 'right-to-left',
      structureCount: 3,
      links: [
        { kind: 'homepage', label: 'Book page', url: 'https://example.org/book' },
        { kind: 'rendering', label: 'PDF', url: 'https://example.org/book.pdf', format: 'application/pdf' },
      ],
    };
    const rows = manifestRows(manifest, MANIFEST_URL);
    expect(rows).toEqual(
      expect.arrayContaining([
        { label: '提供機関', value: 'Example Library' },
        { label: '日付', value: '1700-01-01' },
        { label: '表示方向', value: '右から左' },
        { label: '目次（Range）', value: '3 件' },
        { label: '公開ページ', value: 'Book page', href: 'https://example.org/book' },
        { label: 'ダウンロード', value: 'PDF（application/pdf）', href: 'https://example.org/book.pdf' },
      ]),
    );
  });
});

describe('canvasRows', () => {
  const [tiled, staticImage] = normalizeManifest(v3Manifest).canvases;

  it('describes the page position, size and Image API service', () => {
    expect(canvasRows(tiled, 0, 2)).toEqual([
      { label: 'ページ', value: '1 / 2' },
      { label: 'ラベル', value: 'p. 1' },
      { label: 'サイズ', value: '1,000 × 1,500 px' },
      {
        label: '画像',
        value: 'IIIF Image API v3',
        href: 'https://example.org/iiif/image/p1/info.json',
      },
      { label: 'Canvas ID', value: 'https://example.org/iiif/book/canvas/p1' },
    ]);
  });

  it('describes static images and omits unknown sizes', () => {
    const rows = canvasRows(staticImage, 1, 2);
    expect(rows.find((r) => r.label === '画像')).toEqual({
      label: '画像',
      value: '静的画像',
      href: 'https://example.org/static/p2.png',
    });
    expect(rows.find((r) => r.label === 'サイズ')).toEqual({ label: 'サイズ', value: '800 × 600 px' });
  });

  it('reports a missing image', () => {
    const canvas: CanvasPage = { ...tiled, image: undefined, width: undefined };
    const rows = canvasRows(canvas, 0, 1);
    expect(rows.find((r) => r.label === '画像')).toEqual({ label: '画像', value: '画像なし' });
    expect(labels(rows)).not.toContain('サイズ');
  });

  it('includes canvas-level descriptive metadata and links', () => {
    const canvas: CanvasPage = {
      ...tiled,
      summary: 'Frontispiece',
      attribution: 'Page owner',
      metadata: [{ label: 'Folio', value: '1r' }],
      links: [{ kind: 'seeAlso', label: 'ALTO', url: 'https://example.org/p1.xml' }],
    };
    expect(canvasRows(canvas, 0, 1)).toEqual(
      expect.arrayContaining([
        { label: '概要', value: 'Frontispiece' },
        { label: '帰属表示', value: 'Page owner' },
        { label: 'Folio', value: '1r' },
        { label: '関連データ', value: 'ALTO', href: 'https://example.org/p1.xml' },
      ]),
    );
  });
});
