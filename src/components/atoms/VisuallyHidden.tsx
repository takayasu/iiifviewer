import { makeStyles } from '@fluentui/react-components';
import type { ReactNode } from 'react';

const useStyles = makeStyles({
  root: {
    position: 'absolute',
    width: '1px',
    height: '1px',
    margin: '-1px',
    padding: 0,
    overflow: 'hidden',
    clip: 'rect(0 0 0 0)',
    whiteSpace: 'nowrap',
    border: 0,
  },
});

/** Screen-reader-only text; with `live` it announces changes politely. */
export function VisuallyHidden({ children, live = false }: { readonly children: ReactNode; readonly live?: boolean }) {
  const styles = useStyles();
  return (
    <span className={styles.root} aria-live={live ? 'polite' : undefined}>
      {children}
    </span>
  );
}
