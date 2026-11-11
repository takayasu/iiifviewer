// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { v2Manifest, v3Manifest } from '../test/fixtures';
import { detectVersion, ManifestFormatError, normalizeManifest } from './manifest';

describe('normalizeManifest (v3)', () => {
  const result = normalizeManifest(v3Manifest);

  it('extracts manifest-level fields', () => {
    expect(result).toMatchObject({
      id: 'https://example.org/iiif/book/manifest',
      version: 3,
      label: 'サンプル図書',
      summary: 'A short summary',
      attribution: 'Example Library',
      rights: 'http://creativecommons.org/licenses/by/4.0/',
    });
    expect(result.metadata).toEqual([{ label: 'Author', value: 'Anonymous' }, { label: 'Empty', value: '' }]);
  });

  it('keeps only Canvas items', () => {
    expect(result.canvases).toHaveLength(2);
  });

  it('extracts an image service and derives a thumbnail', () => {
    const [p1] = result.canvases;
    expect(p1).toMatchObject({ label: 'p. 1', width: 1000, height: 1500 });
    expect(p1.image?.service).toEqual({ id: 'https://example.org/iiif/image/p1', version: 3 });
    expect(p1.thumbnail).toBe('https://example.org/iiif/image/p1/full/!200,200/0/default.jpg');
  });

  it('supports static images, explicit thumbnails and default labels', () => {
    const p2 = result.canvases[1];
    expect(p2.label).toBe('2');
    expect(p2.image).toEqual({ url: 'https://example.org/static/p2.png', service: undefined, width: undefined, height: undefined });
    expect(p2.thumbnail).toBe('https://example.org/thumbs/p2.jpg');
  });

  it('takes the first item of a Choice body', () => {
    const canvas = structuredClone(v3Manifest.items[0]) as Record<string, any>;
    const body = canvas.items[0].items[0].body;
    canvas.items[0].items[0].body = { type: 'Choice', items: [body, { id: 'https://x/other.jpg' }] };
    const manifest = normalizeManifest({ ...v3Manifest, items: [canvas] });
    expect(manifest.canvases[0].image?.service?.id).toBe('https://example.org/iiif/image/p1');
  });
});

describe('normalizeManifest (v2)', () => {
  const result = normalizeManifest(v2Manifest);

  it('extracts manifest-level fields', () => {
    expect(result).toMatchObject({
      version: 2,
      label: '和泉国絵図',
      summary: 'An Edo-period map',
      attribution: '国立国会図書館',
      rights: 'https://creativecommons.org/publicdomain/mark/1.0/',
      metadata: [{ label: 'Date', value: '1700' }],
    });
  });

  it('extracts canvases and image services', () => {
    expect(result.canvases).toHaveLength(1);
    expect(result.canvases[0].image).toMatchObject({
      service: { id: 'https://example.org/iiif/v2/image/1', version: 2 },
      width: 4000,
      height: 3000,
    });
  });

  it('uses the default of an oa:Choice resource and strips /info.json from service ids', () => {
    const canvas = structuredClone(v2Manifest.sequences[0].canvases[0]) as Record<string, any>;
    const resource = canvas.images[0].resource;
    resource.service['@id'] = 'https://example.org/iiif/v2/image/1/info.json';
    canvas.images[0].resource = { '@type': 'oa:Choice', default: resource, item: [] };
    const manifest = normalizeManifest({ ...v2Manifest, sequences: [{ canvases: [canvas] }] });
    expect(manifest.canvases[0].image?.service?.id).toBe('https://example.org/iiif/v2/image/1');
  });

  it('ignores non-http service ids and unknown services', () => {
    const canvas = structuredClone(v2Manifest.sequences[0].canvases[0]) as Record<string, any>;
    canvas.images[0].resource.service = [{ '@id': 'javascript:x', profile: 'level2' }, { '@id': 'https://s', profile: 'x' }];
    const manifest = normalizeManifest({ ...v2Manifest, sequences: [{ canvases: [canvas] }] });
    expect(manifest.canvases[0].image?.service).toBeUndefined();
    expect(manifest.canvases[0].image?.url).toBe('https://example.org/iiif/v2/image/1/full/full/0/default.jpg');
  });
});

describe('image body edge cases', () => {
  it('strips trailing slashes from service ids', () => {
    const canvas = structuredClone(v2Manifest.sequences[0].canvases[0]) as Record<string, any>;
    canvas.images[0].resource.service['@id'] = 'https://example.org/iiif/v2/image/1/';
    const manifest = normalizeManifest({ ...v2Manifest, sequences: [{ canvases: [canvas] }] });
    expect(manifest.canvases[0].image?.service?.id).toBe('https://example.org/iiif/v2/image/1');
  });

  it('ignores audio/video bodies', () => {
    const canvas = structuredClone(v3Manifest.items[1]) as Record<string, any>;
    canvas.items[0].items[0].body = { id: 'https://x/v.mp4', type: 'Video', format: 'video/mp4' };
    const manifest = normalizeManifest({ ...v3Manifest, items: [canvas] });
    expect(manifest.canvases[0].image).toBeUndefined();
  });
});

describe('normalizeManifest errors', () => {
  it('rejects non-objects', () => {
    expect(() => normalizeManifest('x')).toThrow(ManifestFormatError);
    expect(() => normalizeManifest([])).toThrow(ManifestFormatError);
  });

  it('rejects collections', () => {
    expect(() => normalizeManifest({ ...v3Manifest, type: 'Collection' })).toThrow(/Collection/);
    expect(() => normalizeManifest({ ...v2Manifest, '@type': 'sc:Collection' })).toThrow(/Collection/);
  });

  it('rejects manifests without canvases', () => {
    expect(() => normalizeManifest({ ...v3Manifest, items: [] })).toThrow(/Canvas/);
  });

  it('rejects documents of unknown version', () => {
    expect(() => normalizeManifest({ label: 'x' })).toThrow(/バージョン/);
  });
});

describe('detectVersion', () => {
  it('infers the version from structure when @context is missing', () => {
    expect(detectVersion({ sequences: [] })).toBe(2);
    expect(detectVersion({ items: [] })).toBe(3);
  });
});
