import { Body1, makeStyles, SearchBox, Text, tokens } from '@fluentui/react-components';
import { useMemo, useState } from 'react';
import { filterEntries } from '../../domain/catalogFilter';
import type { ManifestEntry } from '../../domain/types';
import { ManifestCard } from '../molecules';

const useStyles = makeStyles({
  root: { display: 'flex', flexDirection: 'column', gap: tokens.spacingVerticalM },
  toolbar: { display: 'flex', alignItems: 'center', gap: tokens.spacingHorizontalM, flexWrap: 'wrap' },
  search: { width: '320px', maxWidth: '100%' },
  count: { color: tokens.colorNeutralForeground2 },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
    gap: tokens.spacingHorizontalL,
  },
  empty: { padding: tokens.spacingVerticalXXL, textAlign: 'center', color: tokens.colorNeutralForeground3 },
});

export interface ManifestGalleryProps {
  readonly entries: readonly ManifestEntry[];
  readonly onOpen: (entry: ManifestEntry) => void;
}

export function ManifestGallery({ entries, onOpen }: ManifestGalleryProps) {
  const styles = useStyles();
  const [query, setQuery] = useState('');
  const visible = useMemo(() => filterEntries(entries, query), [entries, query]);

  return (
    <section className={styles.root} aria-label="マニフェスト一覧">
      <div className={styles.toolbar}>
        <SearchBox
          className={styles.search}
          placeholder="タイトル・所蔵機関・タグで絞り込み"
          aria-label="絞り込み"
          value={query}
          onChange={(_, data) => setQuery(data.value)}
        />
        <Text className={styles.count} aria-live="polite">
          {visible.length} / {entries.length} 件
        </Text>
      </div>
      {visible.length === 0 ? (
        <Body1 className={styles.empty}>該当するマニフェストがありません</Body1>
      ) : (
        <div className={styles.grid}>
          {visible.map((entry) => (
            <ManifestCard key={entry.id} entry={entry} onOpen={onOpen} />
          ))}
        </div>
      )}
    </section>
  );
}
