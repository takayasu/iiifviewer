import { Tab, TabList } from '@fluentui/react-components';
import { GridRegular, TableRegular } from '@fluentui/react-icons';
import type { CatalogViewMode } from '../../domain/catalogViewState';

export interface ViewModeSwitchProps {
  readonly value: CatalogViewMode;
  readonly onChange: (mode: CatalogViewMode) => void;
}

export function ViewModeSwitch({ value, onChange }: ViewModeSwitchProps) {
  return (
    <TabList
      size="small"
      appearance="subtle"
      aria-label="表示形式"
      selectedValue={value}
      onTabSelect={(_, data) => onChange(data.value === 'table' ? 'table' : 'card')}
    >
      <Tab value="card" icon={<GridRegular />}>
        カード
      </Tab>
      <Tab value="table" icon={<TableRegular />}>
        テーブル
      </Tab>
    </TabList>
  );
}
