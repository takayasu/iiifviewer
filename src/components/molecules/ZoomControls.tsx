import { makeStyles, Text, tokens } from '@fluentui/react-components';
import {
  ArrowRotateClockwiseRegular,
  ArrowRotateCounterclockwiseRegular,
  FullScreenMaximizeRegular,
  FullScreenMinimizeRegular,
  ZoomFitRegular,
  ZoomInRegular,
  ZoomOutRegular,
} from '@fluentui/react-icons';
import { formatZoom } from '../../domain/viewer';
import { IconButton } from '../atoms';

const useStyles = makeStyles({
  root: { display: 'flex', alignItems: 'center', gap: tokens.spacingHorizontalXXS },
  zoom: { minWidth: '56px', textAlign: 'center', fontVariantNumeric: 'tabular-nums' },
});

export interface ZoomControlsProps {
  readonly zoomPercent: number;
  readonly isFullscreen: boolean;
  readonly onZoomIn: () => void;
  readonly onZoomOut: () => void;
  readonly onReset: () => void;
  readonly onRotate: (deltaDegrees: number) => void;
  readonly onToggleFullscreen: () => void;
}

const ROTATE_STEP = 90;

export function ZoomControls(props: ZoomControlsProps) {
  const styles = useStyles();
  return (
    <div className={styles.root} role="group" aria-label="表示操作">
      <IconButton label="縮小 (-)" icon={<ZoomOutRegular />} onClick={props.onZoomOut} />
      <Text className={styles.zoom} aria-label="現在の倍率">
        {formatZoom(props.zoomPercent)}
      </Text>
      <IconButton label="拡大 (+)" icon={<ZoomInRegular />} onClick={props.onZoomIn} />
      <IconButton label="全体表示 (0)" icon={<ZoomFitRegular />} onClick={props.onReset} />
      <IconButton
        label="左に回転"
        icon={<ArrowRotateCounterclockwiseRegular />}
        onClick={() => props.onRotate(-ROTATE_STEP)}
      />
      <IconButton label="右に回転 (r)" icon={<ArrowRotateClockwiseRegular />} onClick={() => props.onRotate(ROTATE_STEP)} />
      <IconButton
        label={props.isFullscreen ? '全画面を終了 (f)' : '全画面 (f)'}
        icon={props.isFullscreen ? <FullScreenMinimizeRegular /> : <FullScreenMaximizeRegular />}
        onClick={props.onToggleFullscreen}
      />
    </div>
  );
}
