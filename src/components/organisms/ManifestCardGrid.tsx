import { makeStyles, tokens } from '@fluentui/react-components';
import type { ManifestEntry } from '../../domain/types';
import { ManifestCard } from '../molecules';

const useStyles = makeStyles({
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
    gap: tokens.spacingHorizontalL,
  },
});

export interface ManifestCardGridProps {
  readonly entries: readonly ManifestEntry[];
  readonly onOpen: (entry: ManifestEntry) => void;
}

export function ManifestCardGrid({ entries, onOpen }: ManifestCardGridProps) {
  const styles = useStyles();
  return (
    <div className={styles.grid}>
      {entries.map((entry) => (
        <ManifestCard key={entry.id} entry={entry} onOpen={onOpen} />
      ))}
    </div>
  );
}
