import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import type { ManifestEntry } from '../../domain/types';
import { renderWithProviders } from '../../test/renderWithProviders';
import { ManifestGallery } from './ManifestGallery';

const entries: ManifestEntry[] = [
  { id: '1', title: '和泉国絵図', provider: 'NDL', manifestUrl: 'https://a', iiifVersion: 2, tags: ['地図'] },
  { id: '2', title: 'Book', provider: 'Wellcome', manifestUrl: 'https://b', iiifVersion: 3, tags: [], thumbnail: 'https://t' },
];

describe('ManifestGallery', () => {
  it('renders cards with version badges and tags', () => {
    renderWithProviders(<ManifestGallery entries={entries} onOpen={vi.fn()} />);
    expect(screen.getByText('和泉国絵図')).toBeInTheDocument();
    expect(screen.getByText('IIIF v2')).toBeInTheDocument();
    expect(screen.getByText('IIIF v3')).toBeInTheDocument();
    expect(screen.getByText('地図')).toBeInTheDocument();
    expect(screen.getByText('2 / 2 件')).toBeInTheDocument();
  });

  it('filters by query and shows an empty state', async () => {
    renderWithProviders(<ManifestGallery entries={entries} onOpen={vi.fn()} />);
    const search = screen.getByRole('searchbox', { name: '絞り込み' });
    await userEvent.type(search, 'wellcome');
    expect(screen.queryByText('和泉国絵図')).not.toBeInTheDocument();
    expect(screen.getByText('1 / 2 件')).toBeInTheDocument();
    await userEvent.clear(search);
    await userEvent.type(search, 'zzz');
    expect(screen.getByText('該当するマニフェストがありません')).toBeInTheDocument();
  });

  it('opens an entry when its card is clicked', async () => {
    const onOpen = vi.fn();
    renderWithProviders(<ManifestGallery entries={entries} onOpen={onOpen} />);
    await userEvent.click(screen.getByText('Book'));
    expect(onOpen).toHaveBeenCalledWith(entries[1]);
  });
});
