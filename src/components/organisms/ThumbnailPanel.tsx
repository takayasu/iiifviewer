import { makeStyles, tokens } from '@fluentui/react-components';
import { memo, useEffect, useRef } from 'react';
import type { CanvasPage } from '../../domain/types';
import { CanvasThumbnailItem } from '../molecules';

const useStyles = makeStyles({
  root: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalXS,
    padding: tokens.spacingHorizontalS,
    overflowY: 'auto',
    height: '100%',
    boxSizing: 'border-box',
  },
});

export interface ThumbnailPanelProps {
  readonly canvases: readonly CanvasPage[];
  readonly selectedIndex: number;
  readonly onSelect: (index: number) => void;
}

export const ThumbnailPanel = memo(function ThumbnailPanel({ canvases, selectedIndex, onSelect }: ThumbnailPanelProps) {
  const styles = useStyles();
  const selectedRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    selectedRef.current?.scrollIntoView?.({ block: 'nearest', behavior: 'smooth' });
  }, [selectedIndex]);

  return (
    <nav className={styles.root} aria-label="ページ一覧">
      {canvases.map((canvas, index) => (
        <CanvasThumbnailItem
          key={canvas.id + index}
          ref={index === selectedIndex ? selectedRef : undefined}
          canvas={canvas}
          index={index}
          isSelected={index === selectedIndex}
          onSelect={onSelect}
        />
      ))}
    </nav>
  );
});
