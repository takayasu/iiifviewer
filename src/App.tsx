import { FluentProvider, webDarkTheme, webLightTheme } from '@fluentui/react-components';
import { lazy, Suspense } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { LoadingState } from './components/atoms';
import { AppErrorBoundary } from './components/organisms/AppErrorBoundary';
import { CatalogPage, NotFoundPage } from './components/pages';
import { usePrefersDark } from './hooks/usePrefersDark';

// The viewer pulls in OpenSeadragon; keep it out of the catalogue bundle.
const ViewerPage = lazy(async () => ({ default: (await import('./components/pages/ViewerPage')).ViewerPage }));

export default function App() {
  const prefersDark = usePrefersDark();
  return (
    <FluentProvider theme={prefersDark ? webDarkTheme : webLightTheme}>
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        <AppErrorBoundary>
          <Suspense fallback={<LoadingState />}>
            <Routes>
              <Route path="/" element={<CatalogPage />} />
              <Route path="/viewer" element={<ViewerPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Suspense>
        </AppErrorBoundary>
      </BrowserRouter>
    </FluentProvider>
  );
}
