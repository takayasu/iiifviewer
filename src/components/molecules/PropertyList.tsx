import { Body1, Caption1Strong, Link, makeStyles, tokens } from '@fluentui/react-components';
import type { PropertyRow } from '../../domain/metadataRows';

/** Wide enough for common English metadata labels such as "Publication/creation". */
const LABEL_COLUMN = '8.5em';

const useStyles = makeStyles({
  // Rows take only the height of their content, so sparse metadata stays packed at the top.
  list: { display: 'grid', alignContent: 'start', rowGap: tokens.spacingVerticalS, margin: 0 },
  // Label and value on one line; long values wrap within the value column.
  row: {
    display: 'grid',
    gridTemplateColumns: `${LABEL_COLUMN} minmax(0, 1fr)`,
    columnGap: tokens.spacingHorizontalM,
    alignItems: 'baseline',
  },
  term: { color: tokens.colorNeutralForeground2, wordBreak: 'break-word' },
  value: { margin: 0, wordBreak: 'break-word' },
});

export interface PropertyListProps {
  readonly rows: readonly PropertyRow[];
}

/** Label/value pairs as a description list; rows with `href` open in a new tab. */
export function PropertyList({ rows }: PropertyListProps) {
  const styles = useStyles();
  return (
    <dl className={styles.list}>
      {rows.map((row, index) => (
        <div key={`${row.label}-${index}`} className={styles.row}>
          <dt className={styles.term}>
            <Caption1Strong>{row.label}</Caption1Strong>
          </dt>
          <dd className={styles.value}>
            <Body1>
              {row.href ? (
                <Link href={row.href} target="_blank" rel="noopener noreferrer">
                  {row.value}
                </Link>
              ) : (
                row.value
              )}
            </Body1>
          </dd>
        </div>
      ))}
    </dl>
  );
}
