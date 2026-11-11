export class FetchError extends Error {
  readonly status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = 'FetchError';
    this.status = status;
  }
}

async function request(url: string, accept: string, signal?: AbortSignal): Promise<Response> {
  let response: Response;
  try {
    response = await fetch(url, { signal, headers: { Accept: accept } });
  } catch (error: unknown) {
    if (error instanceof DOMException && error.name === 'AbortError') throw error;
    throw new FetchError('ネットワークエラー、または CORS により取得できませんでした');
  }
  if (!response.ok) {
    throw new FetchError(`取得に失敗しました (HTTP ${response.status})`, response.status);
  }
  return response;
}

export async function fetchText(url: string, signal?: AbortSignal): Promise<string> {
  return (await request(url, 'text/csv,text/plain,*/*', signal)).text();
}

export async function fetchJson(url: string, signal?: AbortSignal): Promise<unknown> {
  const response = await request(url, 'application/ld+json,application/json,*/*', signal);
  try {
    return await response.json();
  } catch {
    throw new FetchError('レスポンスが JSON として解析できません');
  }
}

export function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : '予期しないエラーが発生しました';
}
