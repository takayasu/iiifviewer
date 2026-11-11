import { Body1, Card, makeStyles, Title2, tokens } from '@fluentui/react-components';
import { useNavigate } from 'react-router-dom';
import type { CsvRowError } from '../../domain/catalogCsv';
import type { ManifestEntry } from '../../domain/types';
import { useCatalog } from '../../hooks/useCatalog';
import { viewerPath } from '../../routes';
import { LoadingState } from '../atoms';
import { ErrorNotice, UrlOpenForm } from '../molecules';
import { AppHeader, ManifestGallery } from '../organisms';
import { CatalogTemplate } from '../templates';

const useStyles = makeStyles({
  intro: { display: 'flex', flexDirection: 'column', gap: tokens.spacingVerticalXS },
  lead: { color: tokens.colorNeutralForeground2 },
});

function rowErrorSummary(errors: readonly CsvRowError[]): string {
  return errors.map((e) => (e.row > 0 ? `${e.row}行目: ${e.message}` : e.message)).join(' / ');
}

export function CatalogPage() {
  const styles = useStyles();
  const navigate = useNavigate();
  const catalog = useCatalog();
  const openUrl = (url: string): void => {
    void navigate(viewerPath(url));
  };
  const openEntry = (entry: ManifestEntry): void => openUrl(entry.manifestUrl);

  return (
    <CatalogTemplate header={<AppHeader />}>
      <div className={styles.intro}>
        <Title2 as="h1">IIIF マニフェスト一覧</Title2>
        <Body1 className={styles.lead}>
          ローカルの CSV（public/data/manifests.csv）に登録されたマニフェストです。カードを選択するとビューアで開きます。
        </Body1>
      </div>
      <Card>
        <UrlOpenForm onSubmit={openUrl} />
      </Card>
      {catalog.status === 'loading' && <LoadingState label="一覧を読み込み中…" />}
      {catalog.status === 'error' && <ErrorNotice title="一覧を読み込めませんでした" message={catalog.error} />}
      {catalog.status === 'success' && (
        <>
          {catalog.data.errors.length > 0 && (
            <ErrorNotice
              intent="warning"
              title={`CSV の ${catalog.data.errors.length} 行をスキップしました`}
              message={rowErrorSummary(catalog.data.errors)}
            />
          )}
          <ManifestGallery entries={catalog.data.entries} onOpen={openEntry} />
        </>
      )}
    </CatalogTemplate>
  );
}
