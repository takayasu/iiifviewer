import { makeStyles, tokens } from '@fluentui/react-components';
import OpenSeadragon from 'openseadragon';
import { useEffect, useImperativeHandle, useRef, type Ref } from 'react';
import type { CanvasImage } from '../../domain/types';
import { clipRegion, toTileSource, type ViewportState } from '../../domain/viewer';

const ZOOM_STEP = 1.4;
const FULL_TURN = 360;

const useStyles = makeStyles({
  root: {
    position: 'absolute',
    inset: 0,
    backgroundColor: tokens.colorNeutralBackground4,
  },
});

export interface DeepZoomHandle {
  zoomIn(): void;
  zoomOut(): void;
  reset(): void;
  rotate(deltaDegrees: number): void;
}

export interface DeepZoomViewerProps {
  readonly image?: CanvasImage;
  readonly label: string;
  readonly onViewportChange?: (state: ViewportState) => void;
  readonly onError?: (message: string) => void;
  readonly ref?: Ref<DeepZoomHandle>;
}

function readViewport(viewer: OpenSeadragon.Viewer): ViewportState | undefined {
  const item = viewer.world.getItemAt(0);
  if (!item) return undefined;
  const viewport = viewer.viewport;
  const size = item.getContentSize();
  const imageSize = { width: size.x, height: size.y };
  const bounds = item.viewportToImageRectangle(viewport.getBounds(true));
  return {
    zoomPercent: item.viewportToImageZoom(viewport.getZoom(true)) * 100,
    rotation: ((Math.round(viewport.getRotation(true)) % FULL_TURN) + FULL_TURN) % FULL_TURN,
    region: clipRegion({ x: bounds.x, y: bounds.y, width: bounds.width, height: bounds.height }, imageSize),
    imageSize,
  };
}

function createViewer(element: HTMLElement): OpenSeadragon.Viewer {
  return OpenSeadragon({
    element,
    drawer: 'canvas',
    // Works with servers that do not send CORS headers for tiles.
    crossOriginPolicy: false,
    showNavigationControl: false,
    // Our app-level shortcuts own the keyboard; OSD's defaults (r/f/+/-/arrows) would double-fire.
    keyboardNavEnabled: false,
    showNavigator: true,
    navigatorPosition: 'BOTTOM_RIGHT',
    navigatorAutoFade: false,
    navigatorSizeRatio: 0.18,
    // Fluent brand token (CSS variable provided by FluentProvider).
    navigatorDisplayRegionColor: 'var(--colorBrandStroke1)',
    visibilityRatio: 0.5,
    minZoomImageRatio: 0.5,
    maxZoomPixelRatio: 4,
    gestureSettingsMouse: { clickToZoom: false, dblClickToZoom: true },
  });
}

/** Deep-zoom canvas backed by OpenSeadragon (IIIF Image API tiles or a static image). */
export function DeepZoomViewer({ image, label, onViewportChange, onError, ref }: DeepZoomViewerProps) {
  const styles = useStyles();
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<OpenSeadragon.Viewer | null>(null);
  const callbacks = useRef({ onViewportChange, onError });
  useEffect(() => {
    callbacks.current = { onViewportChange, onError };
  });

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return undefined;
    const viewer = createViewer(element);
    viewerRef.current = viewer;

    let frame = 0;
    const emit = (): void => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const state = readViewport(viewer);
        if (state) callbacks.current.onViewportChange?.(state);
      });
    };
    viewer.addHandler('open', emit);
    viewer.addHandler('animation', emit);
    viewer.addHandler('rotate', emit);
    viewer.addHandler('resize', emit);
    viewer.addHandler('open-failed', (event) => {
      callbacks.current.onError?.(`画像を開けませんでした: ${event.message ?? '不明なエラー'}`);
    });

    return () => {
      cancelAnimationFrame(frame);
      viewer.destroy();
      viewerRef.current = null;
    };
  }, []);

  useEffect(() => {
    const viewer = viewerRef.current;
    const tileSource = toTileSource(image);
    if (!viewer) return;
    if (!tileSource) {
      viewer.close();
      onError?.('このページには表示可能な画像がありません');
      return;
    }
    viewer.open({ tileSource });
  }, [image, onError]);

  useImperativeHandle(
    ref,
    () => ({
      zoomIn: () => viewerRef.current?.viewport.zoomBy(ZOOM_STEP),
      zoomOut: () => viewerRef.current?.viewport.zoomBy(1 / ZOOM_STEP),
      reset: () => {
        viewerRef.current?.viewport.setRotation(0);
        viewerRef.current?.viewport.goHome();
      },
      rotate: (delta: number) => {
        const viewport = viewerRef.current?.viewport;
        viewport?.setRotation(viewport.getRotation() + delta);
      },
    }),
    [],
  );

  return <div ref={containerRef} className={styles.root} role="group" aria-roledescription="画像ビューア" aria-label={label} />;
}
