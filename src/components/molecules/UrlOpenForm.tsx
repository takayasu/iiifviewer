import { Button, Field, Input, makeStyles, tokens } from '@fluentui/react-components';
import { OpenRegular } from '@fluentui/react-icons';
import { useState, type FormEvent } from 'react';
import { isHttpUrl } from '../../domain/url';

const useStyles = makeStyles({
  form: { display: 'flex', gap: tokens.spacingHorizontalS, alignItems: 'flex-end' },
  field: { flexGrow: 1 },
});

export interface UrlOpenFormProps {
  readonly onSubmit: (url: string) => void;
}

/** Open an arbitrary manifest URL that is not in the catalogue. */
export function UrlOpenForm({ onSubmit }: UrlOpenFormProps) {
  const styles = useStyles();
  const [value, setValue] = useState('');
  const [error, setError] = useState<string | undefined>();

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    const url = value.trim();
    if (!isHttpUrl(url)) {
      setError('http:// または https:// で始まる URL を入力してください');
      return;
    }
    setError(undefined);
    onSubmit(url);
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <Field
        className={styles.field}
        label="マニフェスト URL を直接開く"
        validationState={error ? 'error' : 'none'}
        validationMessage={error}
      >
        <Input
          type="url"
          value={value}
          placeholder="https://example.org/iiif/manifest.json"
          onChange={(_, data) => setValue(data.value)}
        />
      </Field>
      <Button type="submit" appearance="primary" icon={<OpenRegular />}>
        開く
      </Button>
    </form>
  );
}
