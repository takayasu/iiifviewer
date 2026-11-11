import { Button } from '@fluentui/react-components';
import { ArrowLeftRegular } from '@fluentui/react-icons';
import { useNavigate } from 'react-router-dom';

export function BackToCatalogButton({ label = '一覧へ戻る' }: { readonly label?: string }) {
  const navigate = useNavigate();
  return (
    <Button icon={<ArrowLeftRegular />} onClick={() => void navigate('/')}>
      {label}
    </Button>
  );
}
