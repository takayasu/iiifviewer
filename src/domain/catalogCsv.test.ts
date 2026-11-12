// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { parseCatalogCsv } from './catalogCsv';

const HEADER = 'id,title,provider,manifestUrl,iiifVersion,description,tags';

describe('parseCatalogCsv', () => {
  it('parses valid rows into entries', () => {
    const csv = `${HEADER}\na,Book,Lib,https://x.org/m.json,3,"desc, with comma",map; japan ;\n`;
    const { entries, errors } = parseCatalogCsv(csv);
    expect(errors).toEqual([]);
    expect(entries).toEqual([
      {
        id: 'a',
        title: 'Book',
        provider: 'Lib',
        manifestUrl: 'https://x.org/m.json',
        iiifVersion: 3,
        description: 'desc, with comma',
        tags: ['map', 'japan'],
      },
    ]);
  });

  it('applies defaults for optional columns', () => {
    const { entries } = parseCatalogCsv('title,manifestUrl\nOnly,https://x.org/m\n');
    expect(entries[0]).toMatchObject({ id: 'row-1', provider: '不明', tags: [] });
    expect(entries[0].iiifVersion).toBeUndefined();
    expect(entries[0].description).toBeUndefined();
  });

  it('reports invalid rows without dropping valid ones', () => {
    const csv = `${HEADER}\na,,L,https://x.org/1,2,,\nb,Bad url,L,javascript:alert(1),2,,\nc,Good,L,https://x.org/3,2,,\n`;
    const { entries, errors } = parseCatalogCsv(csv);
    expect(entries.map((e) => e.id)).toEqual(['c']);
    expect(errors).toEqual([
      { row: 1, message: 'title が空です' },
      { row: 2, message: 'manifestUrl が不正です: "javascript:alert(1)"' },
    ]);
  });

  it('fails when required columns are missing', () => {
    const { entries, errors } = parseCatalogCsv('id,name\n1,x\n');
    expect(entries).toEqual([]);
    expect(errors[0].message).toContain('title, manifestUrl');
  });

  it('reports duplicate ids and keeps the first', () => {
    const { entries, errors } = parseCatalogCsv('id,title,manifestUrl\nx,A,https://a\nx,B,https://b\n');
    expect(entries.map((e) => e.title)).toEqual(['A']);
    expect(errors[0].message).toContain('重複');
  });

  it('reports malformed CSV rows instead of silently mis-parsing them', () => {
    const { entries, errors } = parseCatalogCsv('title,manifestUrl\nA,https://a\n"B,https://b\n');
    expect(entries.map((e) => e.title)).toEqual(['A']);
    expect(errors.some((e) => e.message.startsWith('CSV 構文エラー'))).toBe(true);
  });

  it('parses an optional thumbnailUrl column', () => {
    const csv = 'title,manifestUrl,thumbnailUrl\nA,https://x.org/a,https://x.org/a/thumb.jpg\nB,https://x.org/b,\n';
    const { entries, errors } = parseCatalogCsv(csv);
    expect(errors).toEqual([]);
    expect(entries[0].thumbnailUrl).toBe('https://x.org/a/thumb.jpg');
    expect(entries[1].thumbnailUrl).toBeUndefined();
  });

  it('keeps the row but drops and reports an invalid thumbnailUrl', () => {
    const csv = 'title,manifestUrl,thumbnailUrl\nA,https://x.org/a,javascript:alert(1)\n';
    const { entries, errors } = parseCatalogCsv(csv);
    expect(entries).toHaveLength(1);
    expect(entries[0].thumbnailUrl).toBeUndefined();
    expect(errors).toEqual([
      { row: 1, message: 'thumbnailUrl が不正です（サムネイルなしで表示）: "javascript:alert(1)"' },
    ]);
  });

  it('skips blank lines', () => {
    const { entries } = parseCatalogCsv('title,manifestUrl\n\nA,https://x.org/a\n   \n');
    expect(entries).toHaveLength(1);
  });

  it('parses the bundled test catalogue', async () => {
    const { readFile } = await import('node:fs/promises');
    const csv = await readFile(`${process.cwd()}/public/data/manifests.csv`, 'utf8');
    const { entries, errors } = parseCatalogCsv(csv);
    expect(errors).toEqual([]);
    expect(entries.length).toBeGreaterThanOrEqual(30);
    expect(entries.filter((e) => e.provider === '国立国会図書館').length).toBeGreaterThanOrEqual(15);
    expect(new Set(entries.map((e) => e.provider)).size).toBeGreaterThanOrEqual(5);
    // Guards against unquoted commas in URLs shifting columns.
    for (const entry of entries) {
      expect(entry.iiifVersion, entry.id).toBeDefined();
      expect(entry.thumbnailUrl, entry.id).toMatch(/^https:\/\//);
      expect(entry.description ?? '', entry.id).not.toMatch(/default\.jpg|^https?:/);
    }
  });
});
