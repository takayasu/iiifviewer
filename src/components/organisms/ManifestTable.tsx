import {
  Caption1,
  Link,
  makeStyles,
  Table,
  TableBody,
  TableCell,
  TableCellLayout,
  TableHeader,
  TableHeaderCell,
  TableRow,
  tokens,
} from '@fluentui/react-components';
import type { MouseEvent } from 'react';
import type { ManifestEntry } from '../../domain/types';
import { VersionBadge } from '../atoms';

const useStyles = makeStyles({
  wrapper: {
    overflowX: 'auto',
    backgroundColor: tokens.colorNeutralBackground1,
    borderRadius: tokens.borderRadiusMedium,
    boxShadow: tokens.shadow4,
  },
  table: { minWidth: '720px' },
  row: { cursor: 'pointer' },
  title: { fontWeight: tokens.fontWeightSemibold, textAlign: 'start' },
  description: { color: tokens.colorNeutralForeground2 },
  colTitle: { width: '30%' },
  colProvider: { width: '18%' },
  colVersion: { width: '88px' },
  colTags: { width: '16%' },
});

export interface ManifestTableProps {
  readonly entries: readonly ManifestEntry[];
  readonly onOpen: (entry: ManifestEntry) => void;
}

export function ManifestTable({ entries, onOpen }: ManifestTableProps) {
  const styles = useStyles();
  const openFromLink = (event: MouseEvent, entry: ManifestEntry): void => {
    event.stopPropagation();
    onOpen(entry);
  };

  return (
    <div className={styles.wrapper}>
      <Table className={styles.table} size="small" aria-label="マニフェスト一覧">
        <TableHeader>
          <TableRow>
            <TableHeaderCell className={styles.colTitle}>タイトル</TableHeaderCell>
            <TableHeaderCell className={styles.colProvider}>所蔵機関</TableHeaderCell>
            <TableHeaderCell className={styles.colVersion}>IIIF</TableHeaderCell>
            <TableHeaderCell>説明</TableHeaderCell>
            <TableHeaderCell className={styles.colTags}>タグ</TableHeaderCell>
          </TableRow>
        </TableHeader>
        <TableBody>
          {entries.map((entry) => (
            <TableRow key={entry.id} className={styles.row} onClick={() => onOpen(entry)}>
              <TableCell>
                <TableCellLayout truncate>
                  {/* The link is the keyboard-accessible target; the whole row is also clickable. */}
                  <Link as="button" className={styles.title} onClick={(event) => openFromLink(event, entry)}>
                    {entry.title}
                  </Link>
                </TableCellLayout>
              </TableCell>
              <TableCell>
                <TableCellLayout truncate>{entry.provider}</TableCellLayout>
              </TableCell>
              <TableCell>
                <VersionBadge version={entry.iiifVersion} />
              </TableCell>
              <TableCell>
                <TableCellLayout truncate>
                  <Caption1 className={styles.description}>{entry.description ?? ''}</Caption1>
                </TableCellLayout>
              </TableCell>
              <TableCell>
                <TableCellLayout truncate>
                  <Caption1>{entry.tags.join('・')}</Caption1>
                </TableCellLayout>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
