import { Button } from '@fluentui/react-components';
import { Component, type ErrorInfo, type ReactNode } from 'react';
import { ErrorNotice } from '../molecules';

interface AppErrorBoundaryProps {
  readonly children: ReactNode;
}

interface AppErrorBoundaryState {
  readonly error?: Error;
}

/** Last-resort fallback so a render/chunk-load failure never leaves a blank screen. */
export class AppErrorBoundary extends Component<AppErrorBoundaryProps, AppErrorBoundaryState> {
  state: AppErrorBoundaryState = {};

  static getDerivedStateFromError(error: Error): AppErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('Unhandled UI error', error, info.componentStack);
  }

  render(): ReactNode {
    if (!this.state.error) return this.props.children;
    return (
      <div style={{ padding: 24 }}>
        <ErrorNotice
          title="画面を表示できませんでした"
          message={this.state.error.message}
          action={<Button onClick={() => window.location.assign(import.meta.env.BASE_URL)}>一覧を再読み込み</Button>}
        />
      </div>
    );
  }
}
