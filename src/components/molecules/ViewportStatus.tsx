import { Caption1, makeStyles, tokens } from '@fluentui/react-components';
import { formatRegion, type ViewportState } from '../../domain/viewer';

const useStyles = makeStyles({
  root: {
    display: 'flex',
    gap: tokens.spacingHorizontalM,
    color: tokens.colorNeutralForeground2,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
  },
});

export interface ViewportStatusProps {
  readonly viewport: ViewportState;
}

/** Text readout of the visible image region (in source-image pixels). */
export function ViewportStatus({ viewport }: ViewportStatusProps) {
  const styles = useStyles();
  const { imageSize } = viewport;
  return (
    <div className={styles.root} aria-label="ビューポート情報">
      <Caption1>表示領域 {formatRegion(viewport.region)}</Caption1>
      {imageSize && (
        <Caption1>
          原寸 {imageSize.width}×{imageSize.height}px
        </Caption1>
      )}
      <Caption1>回転 {viewport.rotation}°</Caption1>
    </div>
  );
}
