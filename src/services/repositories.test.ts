// @vitest-environment node
import { describe, expect, it, vi } from 'vitest';
import { v3Manifest } from '../test/fixtures';
import { loadCatalog } from './catalogRepository';
import { loadManifest } from './manifestRepository';

describe('loadManifest', () => {
  it('fetches and normalizes a manifest', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify(v3Manifest)));
    const manifest = await loadManifest('https://example.org/manifest');
    expect(manifest.canvases).toHaveLength(2);
  });

  it('refuses non-http URLs without fetching', async () => {
    const spy = vi.spyOn(globalThis, 'fetch');
    await expect(loadManifest('javascript:alert(1)')).rejects.toThrow(/http/);
    expect(spy).not.toHaveBeenCalled();
  });
});

describe('loadCatalog', () => {
  it('fetches and parses the CSV', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('title,manifestUrl\nA,https://x/m\n'));
    const result = await loadCatalog(undefined, '/data/test.csv');
    expect(result.entries[0].title).toBe('A');
    expect(globalThis.fetch).toHaveBeenCalledWith('/data/test.csv', expect.anything());
  });
});
