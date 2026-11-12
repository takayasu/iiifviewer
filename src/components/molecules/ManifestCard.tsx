import { Caption1, Card, CardHeader, makeStyles, Tag, TagGroup, Text, tokens } from '@fluentui/react-components';
import type { ManifestEntry } from '../../domain/types';
import { Thumbnail, VersionBadge } from '../atoms';

const THUMBNAIL_PX = '64px';

const useStyles = makeStyles({
  card: { height: '100%', boxSizing: 'border-box' },
  thumbnail: {
    width: THUMBNAIL_PX,
    height: THUMBNAIL_PX,
    flexShrink: 0,
    borderRadius: tokens.borderRadiusMedium,
  },
  title: { fontWeight: tokens.fontWeightSemibold },
  description: {
    color: tokens.colorNeutralForeground2,
    display: '-webkit-box',
    WebkitLineClamp: 3,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
  },
  footer: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: tokens.spacingHorizontalXS,
    alignItems: 'center',
    marginTop: 'auto',
  },
  tags: { flexWrap: 'wrap', gap: tokens.spacingHorizontalXXS },
});

export interface ManifestCardProps {
  readonly entry: ManifestEntry;
  readonly onOpen: (entry: ManifestEntry) => void;
}

export function ManifestCard({ entry, onOpen }: ManifestCardProps) {
  const styles = useStyles();
  return (
    <Card className={styles.card} onClick={() => onOpen(entry)} aria-label={`${entry.title} を開く`}>
      <CardHeader
        // Decorative: the title right next to it already names the item.
        image={<Thumbnail src={entry.thumbnailUrl} alt="" className={styles.thumbnail} />}
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
