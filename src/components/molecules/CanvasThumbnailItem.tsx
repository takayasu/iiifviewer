import { Caption1, makeStyles, mergeClasses, tokens } from '@fluentui/react-components';
import { forwardRef } from 'react';
import type { CanvasPage } from '../../domain/types';
import { Thumbnail } from '../atoms';

const useStyles = makeStyles({
  item: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch',
    gap: tokens.spacingVerticalXXS,
    padding: tokens.spacingHorizontalXS,
    border: `${tokens.strokeWidthThick} solid transparent`,
    borderRadius: tokens.borderRadiusMedium,
    backgroundColor: 'transparent',
    color: tokens.colorNeutralForeground1,
    cursor: 'pointer',
    width: '100%',
    ':hover': { backgroundColor: tokens.colorSubtleBackgroundHover },
    ':focus-visible': { outline: `${tokens.strokeWidthThick} solid ${tokens.colorStrokeFocus2}` },
  },
  selected: {
    border: `${tokens.strokeWidthThick} solid ${tokens.colorBrandStroke1}`,
    backgroundColor: tokens.colorBrandBackground2,
  },
  image: { height: '120px', borderRadius: tokens.borderRadiusSmall },
  label: { textAlign: 'center', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
});

export interface CanvasThumbnailItemProps {
  readonly canvas: CanvasPage;
  readonly index: number;
  readonly isSelected: boolean;
  readonly onSelect: (index: number) => void;
}

export const CanvasThumbnailItem = forwardRef<HTMLButtonElement, CanvasThumbnailItemProps>(
  function CanvasThumbnailItem({ canvas, index, isSelected, onSelect }, ref) {
    const styles = useStyles();
    const label = `${index + 1}. ${canvas.label}`;
    return (
      <button
        ref={ref}
        type="button"
        className={mergeClasses(styles.item, isSelected && styles.selected)}
        onClick={() => onSelect(index)}
        aria-current={isSelected ? 'page' : undefined}
        title={label}
      >
        <Thumbnail className={styles.image} src={canvas.thumbnail} alt="" />
        <Caption1 className={styles.label}>{label}</Caption1>
      </button>
    );
  },
);
