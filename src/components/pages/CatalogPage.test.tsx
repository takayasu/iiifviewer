import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes, useLocation } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { AppHeader } from '../organisms';
import { renderWithProviders } from '../../test/renderWithProviders';
import { CatalogPage } from './CatalogPage';

function LocationProbe() {
  const location = useLocation();
  return (
    <>
      <AppHeader />
      <div data-testid="location">{location.pathname + location.search}</div>
    </>
  );
}

const CSV = ['title,manifestUrl', ...Array.from({ length: 30 }, (_, i) => `資料 ${i + 1},https://x.org/${i + 1}`)].join('\n');

function renderPage() {
  return renderWithProviders(
    <Routes>
      <Route path="/" element={<CatalogPage />} />
      <Route path="/viewer" element={<LocationProbe />} />
    </Routes>,
  );
}

describe('CatalogPage', () => {
  afterEach(() => window.localStorage.clear());

  it('lists catalogue entries and warns about skipped rows', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response('title,manifestUrl,provider\nA map,https://x.org/m,NDL\nBad,ftp://x,NDL\n'),
    );
    renderPage();
    expect(await screen.findByText('A map')).toBeInTheDocument();
    expect(screen.getByText('CSV の 1 行をスキップしました')).toBeInTheDocument();
  });

  it('navigates to the viewer when a card is opened', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('title,manifestUrl\nA map,https://x.org/m\n'));
    renderPage();
    await userEvent.click(await screen.findByText('A map'));
    expect(screen.getByTestId('location')).toHaveTextContent('/viewer?manifest=https%3A%2F%2Fx.org%2Fm');
  });

  it('restores view mode and page after visiting the viewer and returning via the header link', async () => {
    vi.spyOn(globalThis, 'fetch').mockImplementation(async () => new Response(CSV));
    renderPage();
    await userEvent.click(await screen.findByRole('tab', { name: 'テーブル' }));
    await userEvent.click(screen.getByRole('button', { name: '2 ページ' }));
    await userEvent.click(screen.getByRole('button', { name: '資料 13' }));
    expect(screen.getByTestId('location')).toHaveTextContent('/viewer?manifest=');

    await userEvent.click(screen.getByRole('link', { name: '一覧へ戻る' }));
    expect(await screen.findByRole('tab', { name: 'テーブル', selected: true })).toBeInTheDocument();
    expect(screen.getByText('30 件中 13–24 件を表示')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '資料 13' })).toBeInTheDocument();
  });

  it('shows an error when the CSV cannot be loaded', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('', { status: 404 }));
    renderPage();
    expect(await screen.findByText('一覧を読み込めませんでした')).toBeInTheDocument();
  });
});
