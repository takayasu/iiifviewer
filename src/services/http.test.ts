// @vitest-environment node
import { describe, expect, it, vi } from 'vitest';
import { errorMessage, FetchError, fetchJson, fetchText } from './http';

function mockFetch(impl: () => Promise<Response>): void {
  vi.spyOn(globalThis, 'fetch').mockImplementation(impl);
}

describe('http', () => {
  it('returns text and JSON bodies', async () => {
    mockFetch(async () => new Response('a,b'));
    await expect(fetchText('https://x')).resolves.toBe('a,b');
    mockFetch(async () => new Response('{"a":1}'));
    await expect(fetchJson('https://x')).resolves.toEqual({ a: 1 });
  });

  it('wraps HTTP errors with status', async () => {
    mockFetch(async () => new Response('nope', { status: 404 }));
    await expect(fetchJson('https://x')).rejects.toMatchObject({ name: 'FetchError', status: 404 });
  });

  it('reports network/CORS failures in a user-friendly way', async () => {
    mockFetch(async () => {
      throw new TypeError('Failed to fetch');
    });
    await expect(fetchJson('https://x')).rejects.toThrow(/CORS/);
  });

  it('rethrows aborts untouched', async () => {
    const abort = new DOMException('aborted', 'AbortError');
    mockFetch(async () => {
      throw abort;
    });
    await expect(fetchText('https://x')).rejects.toBe(abort);
  });

  it('rejects invalid JSON', async () => {
    mockFetch(async () => new Response('<html>'));
    await expect(fetchJson('https://x')).rejects.toThrow(/JSON/);
  });

  it('extracts error messages', () => {
    expect(errorMessage(new FetchError('boom'))).toBe('boom');
    expect(errorMessage('x')).toBe('予期しないエラーが発生しました');
  });
});
