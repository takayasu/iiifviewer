import { Button, Caption1, Dropdown, makeStyles, Option, Text, tokens } from '@fluentui/react-components';
import { ChevronLeftRegular, ChevronRightRegular } from '@fluentui/react-icons';
import { useId } from 'react';
import { PAGE_SIZE_OPTIONS, pageTokens } from '../../domain/pagination';
import { IconButton } from '../atoms';

const useStyles = makeStyles({
  root: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: tokens.spacingHorizontalM,
  },
  pages: { display: 'flex', alignItems: 'center', gap: tokens.spacingHorizontalXXS, flexWrap: 'wrap' },
  page: { minWidth: '32px' },
  ellipsis: { minWidth: '24px', textAlign: 'center', color: tokens.colorNeutralForeground3 },
  size: { display: 'flex', alignItems: 'center', gap: tokens.spacingHorizontalS },
  dropdown: { minWidth: '88px' },
  summary: { color: tokens.colorNeutralForeground2, fontVariantNumeric: 'tabular-nums' },
});

export interface PaginationProps {
  /** 1-based. */
  readonly page: number;
  readonly totalPages: number;
  readonly pageSize: number;
  readonly from: number;
  readonly to: number;
  readonly total: number;
  readonly onPageChange: (page: number) => void;
  readonly onPageSizeChange: (pageSize: number) => void;
}

export function Pagination(props: PaginationProps) {
  const styles = useStyles();
  const sizeLabelId = useId();
  const { page, totalPages, onPageChange } = props;

  return (
    <nav className={styles.root} aria-label="ページネーション">
      <Caption1 className={styles.summary}>
        {props.total} 件中 {props.from}–{props.to} 件を表示
      </Caption1>
      <div className={styles.pages}>
        <IconButton
          label="前のページ"
          icon={<ChevronLeftRegular />}
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        />
        {pageTokens(page, totalPages).map((token) =>
          typeof token === 'number' ? (
            <Button
              key={token}
              className={styles.page}
              size="small"
              appearance={token === page ? 'primary' : 'subtle'}
              aria-current={token === page ? 'page' : undefined}
              aria-label={`${token} ページ`}
              onClick={() => onPageChange(token)}
            >
              {token}
            </Button>
          ) : (
            <Text key={token} className={styles.ellipsis} aria-hidden>
              …
            </Text>
          ),
        )}
        <IconButton
          label="次のページ"
          icon={<ChevronRightRegular />}
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        />
      </div>
      <div className={styles.size}>
        <Caption1 id={sizeLabelId}>表示件数</Caption1>
        <Dropdown
          className={styles.dropdown}
          size="small"
          aria-labelledby={sizeLabelId}
          value={`${props.pageSize} 件`}
          selectedOptions={[String(props.pageSize)]}
          onOptionSelect={(_, data) => props.onPageSizeChange(Number(data.optionValue))}
        >
          {PAGE_SIZE_OPTIONS.map((size) => (
            <Option key={size} value={String(size)}>
              {`${size} 件`}
            </Option>
          ))}
        </Dropdown>
      </div>
    </nav>
  );
}
