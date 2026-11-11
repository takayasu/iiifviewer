import {
  Caption1,
  Card,
  CardHeader,
  CardPreview,
  makeStyles,
  Tag,
  TagGroup,
  Text,
  tokens,
} from '@fluentui/react-components';
import type { ManifestEntry } from '../../domain/types';
import { Thumbnail, VersionBadge } from '../atoms';

const useStyles = makeStyles({
  card: { height: '100%' },
  preview: { height: '180px' },
  title: { fontWeight: tokens.fontWeightSemibold },
  description: {
    color: tokens.colorNeutralForeground2,
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
  },
  tags: { flexWrap: 'wrap', gap: tokens.spacingHorizontalXXS },
  footer: { display: 'flex', flexWrap: 'wrap', gap: tokens.spacingHorizontalXS, alignItems: 'center' },
});

export interface ManifestCardProps {
  readonly entry: ManifestEntry;
  readonly onOpen: (entry: ManifestEntry) => void;
}

export function ManifestCard({ entry, onOpen }: ManifestCardProps) {
  const styles = useStyles();
  return (
    <Card className={styles.card} onClick={() => onOpen(entry)} aria-label={`${entry.title} を開く`}>
      <CardPreview className={styles.preview}>
        <Thumbnail src={entry.thumbnail} alt={entry.title} />
      </CardPreview>
      <CardHeader
        header={<Text className={styles.title}>{entry.title}</Text>}
        description={<Caption1>{entry.provider}</Caption1>}
      />
      {entry.description && <Caption1 className={styles.description}>{entry.description}</Caption1>}
      <div className={styles.footer}>
        <VersionBadge version={entry.iiifVersion} />
        {entry.tags.length > 0 && (
          <TagGroup aria-label="タグ" size="extra-small" className={styles.tags}>
            {entry.tags.map((tag) => (
              <Tag key={tag} size="extra-small" appearance="outline">
                {tag}
              </Tag>
            ))}
          </TagGroup>
        )}
      </div>
    </Card>
  );
}
