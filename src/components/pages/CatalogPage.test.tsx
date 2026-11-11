import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes, useLocation } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { renderWithProviders } from '../../test/renderWithProviders';
import { CatalogPage } from './CatalogPage';

function LocationProbe() {
  const location = useLocation();
  return <div data-testid="location">{location.pathname + location.search}</div>;
}

function renderPage() {
  return renderWithProviders(
    <Routes>
      <Route path="/" element={<CatalogPage />} />
      <Route path="/viewer" element={<LocationProbe />} />
    </Routes>,
  );
}

describe('CatalogPage', () => {
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

  it('shows an error when the CSV cannot be loaded', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('', { status: 404 }));
    renderPage();
    expect(await screen.findByText('一覧を読み込めませんでした')).toBeInTheDocument();
  });
});
