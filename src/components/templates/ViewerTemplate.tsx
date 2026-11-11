import { makeStyles, mergeClasses, tokens } from '@fluentui/react-components';
import type { ReactNode, Ref } from 'react';

const useStyles = makeStyles({
  root: { display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' },
  body: { display: 'flex', flexGrow: 1, minHeight: 0 },
  sidebar: {
    width: '168px',
    flexShrink: 0,
    backgroundColor: tokens.colorNeutralBackground2,
    borderRight: `${tokens.strokeWidthThin} solid ${tokens.colorNeutralStroke2}`,
  },
  sidebarHidden: { display: 'none' },
  stage: { display: 'flex', flexDirection: 'column', flexGrow: 1, minWidth: 0 },
  canvas: { position: 'relative', flexGrow: 1, minHeight: 0 },
});

export interface ViewerTemplateProps {
  readonly header: ReactNode;
  readonly sidebar: ReactNode;
  readonly isSidebarOpen: boolean;
  readonly canvas: ReactNode;
  readonly toolbar: ReactNode;
  readonly aside?: ReactNode;
  /** The stage (canvas + toolbar) is the fullscreen target. */
  readonly stageRef?: Ref<HTMLDivElement>;
}

export function ViewerTemplate({ stageRef, ...props }: ViewerTemplateProps) {
  const styles = useStyles();
  return (
    <div className={styles.root}>
      {props.header}
      <div className={styles.body}>
        <aside className={mergeClasses(styles.sidebar, !props.isSidebarOpen && styles.sidebarHidden)}>
          {props.sidebar}
        </aside>
        <div className={styles.stage} ref={stageRef}>
          <div className={styles.canvas}>{props.canvas}</div>
          {props.toolbar}
        </div>
        {props.aside}
      </div>
    </div>
  );
}
