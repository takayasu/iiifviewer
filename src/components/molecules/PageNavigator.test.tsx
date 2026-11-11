import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { renderWithProviders } from '../../test/renderWithProviders';
import { PageNavigator } from './PageNavigator';

describe('PageNavigator', () => {
  it('shows the current page and total', () => {
    renderWithProviders(<PageNavigator index={2} total={10} onChange={vi.fn()} />);
    expect(screen.getByLabelText('ページ番号')).toHaveValue('3');
    expect(screen.getByText('/ 10')).toBeInTheDocument();
  });

  it('disables previous buttons on the first page and next buttons on the last', () => {
    const { unmount } = renderWithProviders(<PageNavigator index={0} total={2} onChange={vi.fn()} />);
    expect(screen.getByRole('button', { name: '前のページ' })).toHaveAttribute('aria-disabled', 'true');
    expect(screen.getByRole('button', { name: '次のページ' })).not.toHaveAttribute('aria-disabled', 'true');
    unmount();
    renderWithProviders(<PageNavigator index={1} total={2} onChange={vi.fn()} />);
    expect(screen.getByRole('button', { name: '最後のページ' })).toHaveAttribute('aria-disabled', 'true');
  });

  it('navigates with buttons', async () => {
    const onChange = vi.fn();
    renderWithProviders(<PageNavigator index={4} total={10} onChange={onChange} />);
    await userEvent.click(screen.getByRole('button', { name: '次のページ' }));
    await userEvent.click(screen.getByRole('button', { name: '前のページ' }));
    await userEvent.click(screen.getByRole('button', { name: '最初のページ' }));
    await userEvent.click(screen.getByRole('button', { name: '最後のページ' }));
    expect(onChange.mock.calls).toEqual([[5], [3], [0], [9]]);
  });

  it('jumps to a typed page (clamped) on Enter', async () => {
    const onChange = vi.fn();
    renderWithProviders(<PageNavigator index={0} total={10} onChange={onChange} />);
    const input = screen.getByLabelText('ページ番号');
    await userEvent.clear(input);
    await userEvent.type(input, '99{Enter}');
    expect(onChange).toHaveBeenCalledWith(9);
  });

  it('keeps focus in the page input after jumping', async () => {
    const { rerender } = renderWithProviders(<PageNavigator index={0} total={10} onChange={vi.fn()} />);
    const input = screen.getByLabelText('ページ番号');
    input.focus();
    rerender(<PageNavigator index={4} total={10} onChange={vi.fn()} />);
    expect(screen.getByLabelText('ページ番号')).toBe(input);
    expect(input).toHaveValue('5');
  });

  it('restores the current page for invalid or unchanged input', async () => {
    const onChange = vi.fn();
    renderWithProviders(<PageNavigator index={9} total={10} onChange={onChange} />);
    const input = screen.getByLabelText('ページ番号');
    await userEvent.clear(input);
    await userEvent.type(input, 'abc{Enter}');
    expect(input).toHaveValue('10');
    await userEvent.clear(input);
    await userEvent.type(input, '500{Enter}');
    expect(input).toHaveValue('10');
    expect(onChange).not.toHaveBeenCalled();
  });
});
