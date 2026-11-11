import { FluentProvider, webLightTheme } from '@fluentui/react-components';
import { render, type RenderResult } from '@testing-library/react';
import type { ReactElement, ReactNode } from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

/** Renders inside Fluent + a memory router; `rerender` keeps the providers (wrapper option). */
export function renderWithProviders(ui: ReactElement, { route = '/', path = '*' } = {}): RenderResult {
  function Wrapper({ children }: { readonly children: ReactNode }) {
    return (
      <FluentProvider theme={webLightTheme}>
        <MemoryRouter initialEntries={[route]}>
          <Routes>
            <Route path={path} element={children} />
          </Routes>
        </MemoryRouter>
      </FluentProvider>
    );
  }
  return render(ui, { wrapper: Wrapper });
}
