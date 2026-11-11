import { makeStyles, Subtitle1, tokens } from '@fluentui/react-components';
import { ImageMultipleFilled } from '@fluentui/react-icons';
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

const useStyles = makeStyles({
  root: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalM,
    height: '48px',
    paddingInline: tokens.spacingHorizontalL,
    backgroundColor: tokens.colorNeutralBackground1,
    borderBottom: `${tokens.strokeWidthThin} solid ${tokens.colorNeutralStroke2}`,
    flexShrink: 0,
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
    color: tokens.colorNeutralForeground1,
    textDecoration: 'none',
    flexShrink: 0,
  },
  logo: { fontSize: '24px', color: tokens.colorBrandForeground1 },
  title: { flexGrow: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  actions: { display: 'flex', gap: tokens.spacingHorizontalXS, flexShrink: 0 },
});

export interface AppHeaderProps {
  readonly title?: ReactNode;
  readonly leading?: ReactNode;
  readonly actions?: ReactNode;
}

export function AppHeader({ title, leading, actions }: AppHeaderProps) {
  const styles = useStyles();
  return (
    <header className={styles.root}>
      {leading}
      <Link to="/" className={styles.brand} aria-label="一覧へ戻る">
        <ImageMultipleFilled className={styles.logo} />
        <Subtitle1>dviewer</Subtitle1>
      </Link>
      <div className={styles.title}>{title}</div>
      {actions && <div className={styles.actions}>{actions}</div>}
    </header>
  );
}
