import { Badge } from '@fluentui/react-components';
import type { IiifVersion } from '../../domain/types';

export interface VersionBadgeProps {
  readonly version?: IiifVersion;
}

export function VersionBadge({ version }: VersionBadgeProps) {
  if (!version) return null;
  return (
    <Badge appearance="tint" color={version === 3 ? 'brand' : 'informative'} size="small">
      IIIF v{version}
    </Badge>
  );
}
