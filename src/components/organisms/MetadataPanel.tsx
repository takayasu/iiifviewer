import {
  Body1,
  Caption1Strong,
  DrawerBody,
  DrawerHeader,
  DrawerHeaderTitle,
  InlineDrawer,
  Link,
  makeStyles,
  tokens,
} from '@fluentui/react-components';
import { DismissRegular } from '@fluentui/react-icons';
import { memo } from 'react';
import type { NormalizedManifest } from '../../domain/types';
import { isHttpUrl } from '../../domain/url';
import { IconButton, VersionBadge } from '../atoms';

const useStyles = makeStyles({
  drawer: { borderLeft: `${tokens.strokeWidthThin} solid ${tokens.colorNeutralStroke2}` },
  list: { display: 'grid', gap: tokens.spacingVerticalM, margin: 0 },
  term: { color: tokens.colorNeutralForeground2 },
  value: { margin: 0, wordBreak: 'break-word' },
});

export interface MetadataPanelProps {
  readonly manifest: NormalizedManifest;
  readonly manifestUrl: string;
  readonly isOpen: boolean;
  readonly onClose: () => void;
}

interface Row {
  readonly label: string;
  readonly value: string;
}

function buildRows(manifest: NormalizedManifest): readonly Row[] {
  const base: Row[] = [
    { label: 'タイトル', value: manifest.label },
    { label: '概要', value: manifest.summary ?? '' },
    { label: '帰属表示', value: manifest.attribution ?? '' },
    { label: 'ライセンス', value: manifest.rights ?? '' },
    { label: 'ページ数', value: String(manifest.canvases.length) },
  ];
  return [...base, ...manifest.metadata].filter((row) => row.value !== '');
}

function Value({ value }: { readonly value: string }) {
  return isHttpUrl(value) ? (
    <Link href={value} target="_blank" rel="noopener noreferrer">
      {value}
    </Link>
  ) : (
    <>{value}</>
  );
}

export const MetadataPanel = memo(function MetadataPanel({ manifest, manifestUrl, isOpen, onClose }: MetadataPanelProps) {
  const styles = useStyles();
  return (
    <InlineDrawer className={styles.drawer} open={isOpen} position="end" separator data-shortcuts="off">
      <DrawerHeader>
        <DrawerHeaderTitle action={<IconButton label="閉じる" icon={<DismissRegular />} onClick={onClose} />}>
          情報 <VersionBadge version={manifest.version} />
        </DrawerHeaderTitle>
      </DrawerHeader>
      <DrawerBody>
        <dl className={styles.list}>
          {buildRows(manifest).map((row, index) => (
            <div key={`${row.label}-${index}`}>
              <dt className={styles.term}>
                <Caption1Strong>{row.label}</Caption1Strong>
              </dt>
              <dd className={styles.value}>
                <Body1>
                  <Value value={row.value} />
                </Body1>
              </dd>
            </div>
          ))}
          <div>
            <dt className={styles.term}>
              <Caption1Strong>マニフェスト URL</Caption1Strong>
            </dt>
            <dd className={styles.value}>
              <Body1>
                <Value value={manifestUrl} />
              </Body1>
            </dd>
          </div>
        </dl>
      </DrawerBody>
    </InlineDrawer>
  );
});
