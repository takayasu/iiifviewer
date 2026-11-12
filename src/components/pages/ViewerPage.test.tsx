import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { v3Manifest } from '../../test/fixtures';
import { renderWithProviders } from '../../test/renderWithProviders';
import { ViewerPage } from './ViewerPage';

const osd = vi.hoisted(() => {
  const handlers = new Map<string, (event: { message?: string }) => void>();
  const viewport = {
    zoomBy: vi.fn(),
    goHome: vi.fn(),
    setRotation: vi.fn(),
    getRotation: vi.fn(() => 0),
    getZoom: vi.fn(() => 1),
    getBounds: vi.fn(() => ({ x: 0, y: 0, width: 1, height: 1 })),
  };
  const item = {
    getContentSize: () => ({ x: 1000, y: 1500 }),
    viewportToImageZoom: vi.fn(() => 0.5),
    viewportToImageRectangle: vi.fn(() => ({ x: -50, y: 20, width: 300, height: 400 })),
  };
  const viewer = {
    viewport,
    world: { getItemAt: () => item },
    open: vi.fn(),
    close: vi.fn(),
    destroy: vi.fn(),
    addHandler: vi.fn((name: string, handler: (event: { message?: string }) => void) => handlers.set(name, handler)),
  };
  return { handlers, viewer, viewport };
});

vi.mock('openseadragon', () => ({ default: vi.fn(() => osd.viewer) }));

const ROUTE = `/viewer?manifest=${encodeURIComponent('https://example.org/iiif/book/manifest')}`;

describe('ViewerPage', () => {
  /** The viewer registers OSD handlers in a mount effect; wait for it before firing events. */
  async function handlerFor(name: string): Promise<(event: { message?: string }) => void> {
    await waitFor(() => expect(osd.handlers.has(name)).toBe(true));
    return osd.handlers.get(name)!;
  }

  beforeEach(() => {
    vi.clearAllMocks();
    osd.handlers.clear();
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify(v3Manifest)));
  });

  it('loads the manifest and opens the first page as IIIF tiles', async () => {
    renderWithProviders(<ViewerPage />, { route: ROUTE });
    expect(await screen.findByTitle('サンプル図書')).toBeInTheDocument();
    expect(osd.viewer.open).toHaveBeenCalledWith({ tileSource: 'https://example.org/iiif/image/p1/info.json' });
    expect(screen.getByRole('navigation', { name: 'ページ一覧' })).toBeInTheDocument();
  });

  it('pages forward via toolbar and keyboard, opening static images too', async () => {
    renderWithProviders(<ViewerPage />, { route: ROUTE });
    await userEvent.click(await screen.findByRole('button', { name: '次のページ' }));
    expect(osd.viewer.open).toHaveBeenLastCalledWith({
      tileSource: { type: 'image', url: 'https://example.org/static/p2.png' },
    });
    fireEvent.keyDown(window, { key: 'ArrowLeft' });
    expect(screen.getByLabelText('ページ番号')).toHaveValue('1');
  });

  it('wires zoom controls and shortcuts to the viewer', async () => {
    renderWithProviders(<ViewerPage />, { route: ROUTE });
    await userEvent.click(await screen.findByRole('button', { name: '拡大 (+)' }));
    await userEvent.click(screen.getByRole('button', { name: '縮小 (-)' }));
    await userEvent.click(screen.getByRole('button', { name: '右に回転 (r)' }));
    fireEvent.keyDown(window, { key: '0' });
    expect(osd.viewport.zoomBy).toHaveBeenCalledTimes(2);
    expect(osd.viewport.setRotation).toHaveBeenCalledWith(90);
    expect(osd.viewport.goHome).toHaveBeenCalled();
  });

  it('shows viewport info reported by the viewer', async () => {
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
      cb(0);
      return 0;
    });
    renderWithProviders(<ViewerPage />, { route: ROUTE });
    await screen.findByTitle('サンプル図書');
    (await handlerFor('open'))({});
    expect(await screen.findByText('50%')).toBeInTheDocument();
    // Region is clipped to the image: x -50..250 → 0..250
    expect(screen.getByText('表示領域 x:0 y:20 250×400px')).toBeInTheDocument();
    expect(screen.getByText('原寸 1000×1500px')).toBeInTheDocument();
  });

  it('shows an image error from the viewer', async () => {
    renderWithProviders(<ViewerPage />, { route: ROUTE });
    await screen.findByTitle('サンプル図書');
    (await handlerFor('open-failed'))({ message: 'Unable to load' });
    expect(await screen.findByText(/画像を開けませんでした: Unable to load/)).toBeInTheDocument();
  });

  it('shows manifest and current-page metadata in an open, closable side pane', async () => {
    renderWithProviders(<ViewerPage />, { route: ROUTE });
    const manifestSection = await screen.findByRole('region', { name: 'マニフェスト' });
    expect(within(manifestSection).getByText('Example Library')).toBeInTheDocument();
    expect(within(manifestSection).getByRole('link', { name: 'http://creativecommons.org/licenses/by/4.0/' })).toHaveAttribute(
      'rel',
      'noopener noreferrer',
    );
    const pageSection = screen.getByRole('region', { name: '表示中のページ' });
    expect(within(pageSection).getByText('1 / 2')).toBeInTheDocument();
    expect(within(pageSection).getByText('p. 1')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: '情報パネル' }));
    expect(screen.queryByRole('region', { name: 'マニフェスト' })).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: '情報パネル' }));
    expect(await screen.findByRole('region', { name: 'マニフェスト' })).toBeInTheDocument();
  });

  it('updates the current-page metadata when the page changes', async () => {
    renderWithProviders(<ViewerPage />, { route: ROUTE });
    await screen.findByRole('region', { name: '表示中のページ' });
    fireEvent.keyDown(window, { key: 'ArrowRight' });
    const pageSection = await screen.findByRole('region', { name: '表示中のページ' });
    await waitFor(() => expect(within(pageSection).getByText('2 / 2')).toBeInTheDocument());
    expect(within(pageSection).getByText('静的画像')).toBeInTheDocument();
  });

  it('shows an error for a missing or unsafe manifest URL', async () => {
    renderWithProviders(<ViewerPage />, { route: '/viewer?manifest=javascript:alert(1)' });
    expect(await screen.findByText('マニフェストを表示できません')).toBeInTheDocument();
    expect(globalThis.fetch).not.toHaveBeenCalled();
  });
});
