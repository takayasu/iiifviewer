import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { DEFAULT_CATALOG_VIEW_STATE, type CatalogViewState } from '../../domain/catalogViewState';
import type { ManifestEntry } from '../../domain/types';
import { renderWithProviders } from '../../test/renderWithProviders';
import { ManifestCatalog } from './ManifestCatalog';

const entries: ManifestEntry[] = Array.from({ length: 30 }, (_, i) => ({
  id: `e${i + 1}`,
  title: `資料 ${i + 1}`,
  provider: i % 2 === 0 ? '国立国会図書館' : 'Wellcome',
  manifestUrl: `https://x.org/${i + 1}`,
  iiifVersion: i % 2 === 0 ? 2 : 3,
  tags: i === 0 ? ['地図'] : [],
  thumbnailUrl: i === 0 ? 'https://x.org/1/thumb.jpg' : undefined,
}));

function Harness({ initial = DEFAULT_CATALOG_VIEW_STATE, onOpen = vi.fn() }) {
  const [state, setState] = useState<CatalogViewState>(initial);
  return (
    <ManifestCatalog
      entries={entries}
      viewState={state}
      onViewStateChange={(patch) => setState((s) => ({ ...s, ...patch }))}
      onOpen={onOpen}
    />
  );
}

describe('ManifestCatalog', () => {
  it('shows the first page of cards with small thumbnails', () => {
    renderWithProviders(<Harness />);
    const cards = screen.getAllByRole('group', { name: /を開く$/ });
    expect(cards).toHaveLength(12);
    // Thumbnails are decorative (the title is next to them), so they carry empty alt text.
    const thumb = cards[0].querySelector('img');
    expect(thumb).toHaveAttribute('src', 'https://x.org/1/thumb.jpg');
    expect(thumb).toHaveAttribute('alt', '');
    // Entries without a thumbnail get a placeholder instead of an image.
    expect(cards[1].querySelector('img')).toBeNull();
    expect(screen.getByText('30 件中 1–12 件を表示')).toBeInTheDocument();
  });

  it('does not show thumbnails in the table view', async () => {
    renderWithProviders(<Harness />);
    await userEvent.click(screen.getByRole('tab', { name: 'テーブル' }));
    const table = screen.getByRole('table', { name: 'マニフェスト一覧' });
    expect(table.querySelector('img')).toBeNull();
  });

  it('pages through results', async () => {
    renderWithProviders(<Harness />);
    await userEvent.click(screen.getByRole('button', { name: '3 ページ' }));
    expect(screen.getByText('30 件中 25–30 件を表示')).toBeInTheDocument();
    expect(screen.getByText('資料 25')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '3 ページ' })).toHaveAttribute('aria-current', 'page');
    await userEvent.click(screen.getByRole('button', { name: '前のページ' }));
    expect(screen.getByText('30 件中 13–24 件を表示')).toBeInTheDocument();
  });

  it('switches to the table view', async () => {
    const onOpen = vi.fn();
    renderWithProviders(<Harness onOpen={onOpen} />);
    await userEvent.click(screen.getByRole('tab', { name: 'テーブル' }));
    const table = screen.getByRole('table', { name: 'マニフェスト一覧' });
    expect(within(table).getAllByRole('row')).toHaveLength(13); // header + 12
    await userEvent.click(within(table).getByRole('button', { name: '資料 2' }));
    expect(onOpen).toHaveBeenCalledTimes(1);
    expect(onOpen).toHaveBeenCalledWith(entries[1]);
  });

  it('resets to page 1 when the query changes', async () => {
    renderWithProviders(<Harness initial={{ ...DEFAULT_CATALOG_VIEW_STATE, page: 3 }} />);
    await userEvent.type(screen.getByRole('searchbox', { name: '絞り込み' }), 'wellcome');
    expect(screen.getByText('15 件中 1–12 件を表示')).toBeInTheDocument();
  });

  it('shows an empty state', async () => {
    renderWithProviders(<Harness />);
    await userEvent.type(screen.getByRole('searchbox', { name: '絞り込み' }), 'zzz');
    expect(screen.getByText('該当するマニフェストがありません')).toBeInTheDocument();
  });

  it('changes the page size', async () => {
    renderWithProviders(<Harness initial={{ ...DEFAULT_CATALOG_VIEW_STATE, page: 2 }} />);
    await userEvent.click(screen.getByRole('combobox', { name: '表示件数' }));
    await userEvent.click(screen.getByRole('option', { name: '24 件' }));
    expect(screen.getByText('30 件中 1–24 件を表示')).toBeInTheDocument();
  });
});
