import { Divider, makeStyles, tokens } from '@fluentui/react-components';
import type { ViewportState } from '../../domain/viewer';
import { PageNavigator, ViewportStatus, ZoomControls } from '../molecules';

const useStyles = makeStyles({
  root: {
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: tokens.spacingHorizontalM,
    padding: `${tokens.spacingVerticalXS} ${tokens.spacingHorizontalM}`,
    backgroundColor: tokens.colorNeutralBackground1,
    borderTop: `${tokens.strokeWidthThin} solid ${tokens.colorNeutralStroke2}`,
    flexShrink: 0,
  },
  divider: { flexGrow: 0, height: '24px' },
  status: { marginInlineStart: 'auto', minWidth: 0 },
});

export interface ViewerToolbarProps {
  readonly pageIndex: number;
  readonly pageCount: number;
  readonly onPageChange: (index: number) => void;
  readonly viewport: ViewportState;
  readonly isFullscreen: boolean;
  readonly onZoomIn: () => void;
  readonly onZoomOut: () => void;
  readonly onReset: () => void;
  readonly onRotate: (deltaDegrees: number) => void;
  readonly onToggleFullscreen: () => void;
}

export function ViewerToolbar(props: ViewerToolbarProps) {
  const styles = useStyles();
  return (
    <div className={styles.root} role="toolbar" aria-label="ビューア操作">
      <PageNavigator index={props.pageIndex} total={props.pageCount} onChange={props.onPageChange} />
      <Divider vertical className={styles.divider} />
      <ZoomControls
        zoomPercent={props.viewport.zoomPercent}
        isFullscreen={props.isFullscreen}
        onZoomIn={props.onZoomIn}
        onZoomOut={props.onZoomOut}
        onReset={props.onReset}
        onRotate={props.onRotate}
        onToggleFullscreen={props.onToggleFullscreen}
      />
      <div className={styles.status}>
        <ViewportStatus viewport={props.viewport} />
      </div>
    </div>
  );
}
