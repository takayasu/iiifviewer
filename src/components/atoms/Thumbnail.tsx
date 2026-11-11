import { makeStyles, mergeClasses, tokens } from '@fluentui/react-components';
import { ImageOffRegular } from '@fluentui/react-icons';
import { useState } from 'react';

const useStyles = makeStyles({
  frame: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    backgroundColor: tokens.colorNeutralBackground3,
    color: tokens.colorNeutralForeground4,
    width: '100%',
    height: '100%',
  },
  image: { width: '100%', height: '100%', objectFit: 'contain' },
  icon: { fontSize: '32px' },
});

export interface ThumbnailProps {
  readonly src?: string;
  readonly alt: string;
  readonly className?: string;
}

/** Lazy-loaded image with a neutral placeholder when missing or broken. */
export function Thumbnail({ src, alt, className }: ThumbnailProps) {
  const styles = useStyles();
  const [failedSrc, setFailedSrc] = useState<string | undefined>();
  const showImage = src !== undefined && failedSrc !== src;

  return (
    <div className={mergeClasses(styles.frame, className)}>
      {showImage ? (
        <img
          className={styles.image}
          src={src}
          alt={alt}
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
          onError={() => setFailedSrc(src)}
        />
      ) : (
        <ImageOffRegular
          className={styles.icon}
          {...(alt ? { role: 'img', 'aria-label': `${alt}（画像なし）` } : { 'aria-hidden': true })}
        />
      )}
    </div>
  );
}
