import { makeStyles, tokens } from '@fluentui/react-components';
import type { ReactNode } from 'react';

const useStyles = makeStyles({
  root: { display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: tokens.colorNeutralBackground2 },
  main: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalL,
    width: '100%',
    maxWidth: '1280px',
    marginInline: 'auto',
    padding: tokens.spacingHorizontalXXL,
    boxSizing: 'border-box',
  },
});

export interface CatalogTemplateProps {
  readonly header: ReactNode;
  readonly children: ReactNode;
}

export function CatalogTemplate({ header, children }: CatalogTemplateProps) {
  const styles = useStyles();
  return (
    <div className={styles.root}>
      {header}
      <main className={styles.main}>{children}</main>
    </div>
  );
}
