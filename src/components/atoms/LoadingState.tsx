import { makeStyles, Spinner } from '@fluentui/react-components';

const useStyles = makeStyles({
  root: { display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px', flexGrow: 1 },
});

export function LoadingState({ label = '読み込み中…' }: { readonly label?: string }) {
  const styles = useStyles();
  return (
    <div className={styles.root}>
      <Spinner label={label} />
    </div>
  );
}
