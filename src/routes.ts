export const MANIFEST_PARAM = 'manifest';

export function viewerPath(manifestUrl: string, page?: number): string {
  const params = new URLSearchParams({ [MANIFEST_PARAM]: manifestUrl });
  if (page !== undefined) params.set('page', String(page));
  return `/viewer?${params.toString()}`;
}
