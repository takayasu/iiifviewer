import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { renderWithProviders } from '../../test/renderWithProviders';
import { UrlOpenForm } from './UrlOpenForm';

describe('UrlOpenForm', () => {
  it('submits a valid URL', async () => {
    const onSubmit = vi.fn();
    renderWithProviders(<UrlOpenForm onSubmit={onSubmit} />);
    await userEvent.type(screen.getByRole('textbox'), ' https://x.org/manifest ');
    await userEvent.click(screen.getByRole('button', { name: '開く' }));
    expect(onSubmit).toHaveBeenCalledWith('https://x.org/manifest');
  });

  it('shows a validation error for unsafe input', async () => {
    const onSubmit = vi.fn();
    renderWithProviders(<UrlOpenForm onSubmit={onSubmit} />);
    await userEvent.type(screen.getByRole('textbox'), 'javascript:alert(1){Enter}');
    expect(screen.getByText(/http:\/\/ または https:\/\//)).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });
});
