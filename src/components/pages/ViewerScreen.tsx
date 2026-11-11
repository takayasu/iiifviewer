import { makeStyles, Subtitle2, tokens } from '@fluentui/react-components';
import { InfoRegular, PanelLeftRegular } from '@fluentui/react-icons';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { NormalizedManifest } from '../../domain/types';
import { INITIAL_VIEWPORT, type ViewportState } from '../../domain/viewer';
import { useFullscreen } from '../../hooks/useFullscreen';
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts';
import { usePageNavigation } from '../../hooks/usePageNavigation';
import { IconButton, VersionBadge, VisuallyHidden } from '../atoms';
import { ErrorNotice } from '../molecules';
import { AppHeader, MetadataPanel, ThumbnailPanel, ViewerToolbar } from '../organisms';
// Imported directly (not via the barrel) so OpenSeadragon stays in the lazy viewer chunk.
import { DeepZoomViewer, type DeepZoomHandle } from '../organisms/DeepZoomViewer';
import { ViewerTemplate } from '../templates';

const useStyles = makeStyles({
  title: { display: 'flex', alignItems: 'center', gap: tokens.spacingHorizontalS, minWidth: 0 },
  titleText: { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  notice: { position: 'absolute', top: tokens.spacingVerticalM, left: tokens.spacingHorizontalM, right: tokens.spacingHorizontalM, zIndex: 1 },
});

export interface ViewerScreenProps {
  readonly manifest: NormalizedManifest;
  readonly manifestUrl: string;
}

export function ViewerScreen({ manifest, manifestUrl }: ViewerScreenProps) {
  const styles = useStyles();
  const zoomRef = useRef<DeepZoomHandle>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [isInfoOpen, setInfoOpen] = useState(false);
  const [viewport, setViewport] = useState<ViewportState>(INITIAL_VIEWPORT);
  const [imageError, setImageError] = useState<{ readonly canvasId: string; readonly message: string }>();

  const pages = usePageNavigation(manifest.canvases.length);
  const fullscreen = useFullscreen(stageRef);
  const canvas = manifest.canvases[pages.index];

  useEffect(() => {
    document.title = `${manifest.label} — dviewer`;
  }, [manifest.label]);

  const canvasId = canvas?.id ?? '';
  const closeInfo = useCallback(() => setInfoOpen(false), []);
  const handleError = useCallback((message: string) => setImageError({ canvasId, message }), [canvasId]);
  const visibleError = imageError?.canvasId === canvasId ? imageError.message : undefined;

  useKeyboardShortcuts({
    ArrowLeft: pages.prev,
    ArrowRight: pages.next,
    PageUp: pages.prev,
    PageDown: pages.next,
    Home: () => pages.goTo(0),
    End: () => pages.goTo(pages.total - 1),
    '+': () => zoomRef.current?.zoomIn(),
    '=': () => zoomRef.current?.zoomIn(),
    '-': () => zoomRef.current?.zoomOut(),
    '0': () => zoomRef.current?.reset(),
    r: () => zoomRef.current?.rotate(90),
    f: fullscreen.toggle,
  });

  const header = (
    <AppHeader
      leading={
        <IconButton
          label="ページ一覧の表示切替"
          icon={<PanelLeftRegular />}
          pressed={isSidebarOpen}
          onClick={() => setSidebarOpen((open) => !open)}
        />
      }
      title={
        <div className={styles.title}>
          <Subtitle2 className={styles.titleText} title={manifest.label}>
            {manifest.label}
          </Subtitle2>
          <VersionBadge version={manifest.version} />
        </div>
      }
      actions={
        <IconButton label="情報パネル" icon={<InfoRegular />} pressed={isInfoOpen} onClick={() => setInfoOpen((o) => !o)} />
      }
    />
  );

  return (
    <ViewerTemplate
      header={header}
      isSidebarOpen={isSidebarOpen}
      sidebar={<ThumbnailPanel canvases={manifest.canvases} selectedIndex={pages.index} onSelect={pages.goTo} />}
      stageRef={stageRef}
      canvas={
        <>
          <DeepZoomViewer
            ref={zoomRef}
            image={canvas?.image}
            label={`${manifest.label} — ${canvas?.label ?? ''}`}
            onViewportChange={setViewport}
            onError={handleError}
          />
          <VisuallyHidden live>{`${pages.index + 1} / ${pages.total} ページ: ${canvas?.label ?? ''}`}</VisuallyHidden>
          {visibleError && (
            <div className={styles.notice}>
              <ErrorNotice title="画像エラー" message={visibleError} />
            </div>
          )}
        </>
      }
      toolbar={
        <ViewerToolbar
          pageIndex={pages.index}
          pageCount={pages.total}
          onPageChange={pages.goTo}
          viewport={viewport}
          isFullscreen={fullscreen.isFullscreen}
          onZoomIn={() => zoomRef.current?.zoomIn()}
          onZoomOut={() => zoomRef.current?.zoomOut()}
          onReset={() => zoomRef.current?.reset()}
          onRotate={(delta) => zoomRef.current?.rotate(delta)}
          onToggleFullscreen={fullscreen.toggle}
        />
      }
      aside={
        <MetadataPanel
          manifest={manifest}
          manifestUrl={manifestUrl}
          isOpen={isInfoOpen}
          onClose={closeInfo}
        />
      }
    />
  );
}
