import { makeStyles, tokens } from '@fluentui/react-components';
import { BackToCatalogButton } from '../atoms';
import { ErrorNotice } from '../molecules';
import { AppHeader } from '../organisms';

const useStyles = makeStyles({ body: { padding: tokens.spacingHorizontalXXL } });

export function NotFoundPage() {
  const styles = useStyles();
  return (
    <>
      <AppHeader />
      <div className={styles.body}>
        <ErrorNotice
          intent="warning"
          title="ページが見つかりません"
          message="URL を確認してください。"
          action={<BackToCatalogButton label="一覧へ" />}
        />
      </div>
    </>
  );
}
