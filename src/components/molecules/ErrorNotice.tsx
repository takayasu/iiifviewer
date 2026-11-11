import { MessageBar, MessageBarActions, MessageBarBody, MessageBarTitle } from '@fluentui/react-components';
import type { ReactNode } from 'react';

export interface ErrorNoticeProps {
  readonly title: string;
  readonly message: string;
  readonly intent?: 'error' | 'warning';
  readonly action?: ReactNode;
}

export function ErrorNotice({ title, message, intent = 'error', action }: ErrorNoticeProps) {
  return (
    <MessageBar intent={intent} layout="multiline">
      <MessageBarBody>
        <MessageBarTitle>{title}</MessageBarTitle>
        {message}
      </MessageBarBody>
      {action && <MessageBarActions>{action}</MessageBarActions>}
    </MessageBar>
  );
}
