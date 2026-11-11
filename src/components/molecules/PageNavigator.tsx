import { Input, makeStyles, Text, tokens } from '@fluentui/react-components';
import {
  ChevronDoubleLeftRegular,
  ChevronDoubleRightRegular,
  ChevronLeftRegular,
  ChevronRightRegular,
} from '@fluentui/react-icons';
import { useState, type KeyboardEvent } from 'react';
import { clampPageIndex } from '../../domain/viewer';
import { IconButton } from '../atoms';

const useStyles = makeStyles({
  root: { display: 'flex', alignItems: 'center', gap: tokens.spacingHorizontalXXS },
  input: { width: '64px', textAlign: 'center' },
  total: { whiteSpace: 'nowrap', paddingInline: tokens.spacingHorizontalXS },
});

export interface PageNavigatorProps {
  /** 0-based current index. */
  readonly index: number;
  readonly total: number;
  readonly onChange: (index: number) => void;
}

interface PageNumberInputProps {
  readonly index: number;
  readonly total: number;
  readonly className: string;
  readonly onChange: (index: number) => void;
}

function PageNumberInput({ index, total, className, onChange }: PageNumberInputProps) {
  const [draft, setDraft] = useState(String(index + 1));
  const [syncedIndex, setSyncedIndex] = useState(index);
  // Sync the draft when the page changes externally (render-time adjustment; keeps focus, no remount).
  if (syncedIndex !== index) {
    setSyncedIndex(index);
    setDraft(String(index + 1));
  }

  const commit = (): void => {
    const page = Number.parseInt(draft, 10);
    const target = Number.isNaN(page) ? index : clampPageIndex(page - 1, total);
    if (target === index) {
      setDraft(String(index + 1));
      return;
    }
    onChange(target);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>): void => {
    if (event.key === 'Enter') commit();
  };

  return (
    <Input
      className={className}
      size="small"
      inputMode="numeric"
      aria-label="ページ番号"
      value={draft}
      onChange={(_, data) => setDraft(data.value)}
      onBlur={commit}
      onKeyDown={onKeyDown}
    />
  );
}

export function PageNavigator({ index, total, onChange }: PageNavigatorProps) {
  const styles = useStyles();
  const isFirst = index <= 0;
  const isLast = index >= total - 1;

  return (
    <div className={styles.root} role="group" aria-label="ページ移動">
      <IconButton label="最初のページ" icon={<ChevronDoubleLeftRegular />} disabled={isFirst} onClick={() => onChange(0)} />
      <IconButton label="前のページ" icon={<ChevronLeftRegular />} disabled={isFirst} onClick={() => onChange(index - 1)} />
      <PageNumberInput index={index} total={total} className={styles.input} onChange={onChange} />
      <Text className={styles.total}>/ {total}</Text>
      <IconButton label="次のページ" icon={<ChevronRightRegular />} disabled={isLast} onClick={() => onChange(index + 1)} />
      <IconButton
        label="最後のページ"
        icon={<ChevronDoubleRightRegular />}
        disabled={isLast}
        onClick={() => onChange(total - 1)}
      />
    </div>
  );
}
