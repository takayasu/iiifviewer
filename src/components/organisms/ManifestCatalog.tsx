import { Body1, makeStyles, SearchBox, tokens } from '@fluentui/react-components';
import { useMemo, useRef } from 'react';
import { filterEntries } from '../../domain/catalogFilter';
import type { CatalogViewState } from '../../domain/catalogViewState';
import { paginate } from '../../domain/pagination';
import type { ManifestEntry } from '../../domain/types';
import type { CatalogViewStateUpdate } from '../../hooks/useCatalogViewState';
import { Pagination, ViewModeSwitch } from '../molecules';
import { ManifestCardGrid } from './ManifestCardGrid';
import { ManifestTable } from './ManifestTable';

const useStyles = makeStyles({
  root: { display: 'flex', flexDirection: 'column', gap: tokens.spacingVerticalM, scrollMarginTop: '16px' },
  toolbar: { display: 'flex', alignItems: 'center', gap: tokens.spacingHorizontalM, flexWrap: 'wrap' },
  search: { width: '320px', maxWidth: '100%' },
  spacer: { flexGrow: 1 },
  empty: { padding: tokens.spacingVerticalXXL, textAlign: 'center', color: tokens.colorNeutralForeground3 },
});

export interface ManifestCatalogProps {
  readonly entries: readonly ManifestEntry[];
  readonly viewState: CatalogViewState;
  readonly onViewStateChange: CatalogViewStateUpdate;
  readonly onOpen: (entry: ManifestEntry) => void;
}

/** Search + card/table switch + pagination over the catalogue entries. */
export function ManifestCatalog({ entries, viewState, onViewStateChange, onOpen }: ManifestCatalogProps) {
  const styles = useStyles();
  const sectionRef = useRef<HTMLElement>(null);
  const filtered = useMemo(() => filterEntries(entries, viewState.query), [entries, viewState.query]);
  const slice = paginate(filtered, viewState.page, viewState.pageSize);

  const changePage = (page: number): void => {
    onViewStateChange({ page });
    sectionRef.current?.scrollIntoView?.({ block: 'start', behavior: 'smooth' });
  };

  return (
    <section ref={sectionRef} className={styles.root} aria-label="マニフェスト一覧">
      <div className={styles.toolbar}>
        <SearchBox
          className={styles.search}
          placeholder="タイトル・所蔵機関・タグで絞り込み"
          aria-label="絞り込み"
          value={viewState.query}
          onChange={(_, data) => onViewStateChange({ query: data.value, page: 1 })}
        />
        <div className={styles.spacer} />
        <ViewModeSwitch value={viewState.view} onChange={(view) => onViewStateChange({ view })} />
      </div>
      {slice.total === 0 ? (
        <Body1 className={styles.empty}>該当するマニフェストがありません</Body1>
      ) : viewState.view === 'table' ? (
        <ManifestTable entries={slice.items} onOpen={onOpen} />
      ) : (
        <ManifestCardGrid entries={slice.items} onOpen={onOpen} />
      )}
      <Pagination
        page={slice.page}
        totalPages={slice.totalPages}
        pageSize={viewState.pageSize}
        from={slice.from}
        to={slice.to}
        total={slice.total}
        onPageChange={changePage}
        onPageSizeChange={(pageSize) => onViewStateChange({ pageSize, page: 1 })}
      />
    </section>
  );
}
