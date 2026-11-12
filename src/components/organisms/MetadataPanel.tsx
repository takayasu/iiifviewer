import {
  DrawerBody,
  DrawerHeader,
  DrawerHeaderTitle,
  InlineDrawer,
  makeStyles,
  mergeClasses,
  Subtitle2,
  tokens,
} from '@fluentui/react-components';
import { DismissRegular } from '@fluentui/react-icons';
import { memo, useId, useMemo } from 'react';
import { canvasRows, manifestRows, type PropertyRow } from '../../domain/metadataRows';
import type { CanvasPage, NormalizedManifest } from '../../domain/types';
import { IconButton, VersionBadge } from '../atoms';
import { PropertyList } from '../molecules';

const PANEL_WIDTH = '340px';

const useStyles = makeStyles({
  drawer: { borderLeft: `${tokens.strokeWidthThin} solid ${tokens.colorNeutralStroke2}`, width: PANEL_WIDTH },
  // alignContent: start — without it the grid stretches rows to fill the drawer height.
  body: { display: 'grid', alignContent: 'start', rowGap: tokens.spacingVerticalL, paddingBottom: tokens.spacingVerticalL },
  section: { display: 'grid', alignContent: 'start', rowGap: tokens.spacingVerticalS },
  pageSection: {
    paddingTop: tokens.spacingVerticalM,
    borderTop: `${tokens.strokeWidthThin} solid ${tokens.colorNeutralStroke2}`,
  },
});

export interface MetadataPanelProps {
  readonly manifest: NormalizedManifest;
  readonly manifestUrl: string;
  /** The canvas currently shown in the viewer. */
  readonly canvas?: CanvasPage;
  readonly pageIndex: number;
  readonly isOpen: boolean;
  readonly onClose: () => void;
}

interface SectionProps {
  readonly title: string;
  readonly rows: readonly PropertyRow[];
  readonly className?: string;
}

function Section({ title, rows, className }: SectionProps) {
  const styles = useStyles();
  const headingId = useId();
  return (
    <section aria-labelledby={headingId} className={mergeClasses(styles.section, className)}>
      <Subtitle2 as="h2" id={headingId}>
        {title}
      </Subtitle2>
      <PropertyList rows={rows} />
    </section>
  );
}

/** Closable right pane: manifest-wide information above, the current canvas below. */
export const MetadataPanel = memo(function MetadataPanel({
  manifest,
  manifestUrl,
  canvas,
  pageIndex,
  isOpen,
  onClose,
}: MetadataPanelProps) {
  const styles = useStyles();
  const manifestInfo = useMemo(() => manifestRows(manifest, manifestUrl), [manifest, manifestUrl]);
  const pageInfo = useMemo(
    () => (canvas ? canvasRows(canvas, pageIndex, manifest.canvases.length) : []),
    [canvas, pageIndex, manifest.canvases.length],
  );

  return (
    <InlineDrawer className={styles.drawer} open={isOpen} position="end" separator data-shortcuts="off">
      <DrawerHeader>
        <DrawerHeaderTitle action={<IconButton label="閉じる" icon={<DismissRegular />} onClick={onClose} />}>
          情報 <VersionBadge version={manifest.version} />
        </DrawerHeaderTitle>
      </DrawerHeader>
      <DrawerBody className={styles.body}>
        <Section title="マニフェスト" rows={manifestInfo} />
        {canvas && <Section title="表示中のページ" rows={pageInfo} className={styles.pageSection} />}
      </DrawerBody>
    </InlineDrawer>
  );
});
