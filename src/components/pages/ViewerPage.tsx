import { makeStyles, tokens } from '@fluentui/react-components';
import { useSearchParams } from 'react-router-dom';
import { isHttpUrl } from '../../domain/url';
import { useManifest } from '../../hooks/useManifest';
import { MANIFEST_PARAM } from '../../routes';
import { BackToCatalogButton, LoadingState } from '../atoms';
import { ErrorNotice } from '../molecules';
import { AppHeader } from '../organisms';
import { ViewerScreen } from './ViewerScreen';

const useStyles = makeStyles({
  status: { display: 'flex', flexDirection: 'column', padding: tokens.spacingHorizontalXXL, gap: tokens.spacingVerticalL },
});

export function ViewerPage() {
  const styles = useStyles();
  const [params] = useSearchParams();
  const rawUrl = params.get(MANIFEST_PARAM);
  const manifestUrl = isHttpUrl(rawUrl) ? rawUrl : undefined;
  const manifest = useManifest(manifestUrl);

  if (manifest.status === 'success') {
    return <ViewerScreen manifest={manifest.data} manifestUrl={manifestUrl ?? ''} />;
  }

  return (
    <>
      <AppHeader />
      <div className={styles.status}>
        {manifest.status === 'loading' ? (
          <LoadingState label="マニフェストを読み込み中…" />
        ) : (
          <ErrorNotice
            title="マニフェストを表示できません"
            message={`${manifest.error}${rawUrl ? `（${rawUrl}）` : ''}`}
            action={<BackToCatalogButton />}
          />
        )}
      </div>
    </>
  );
}
