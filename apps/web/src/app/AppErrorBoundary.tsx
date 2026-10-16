import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Button } from '../shared/components/primitives';
import { LocaleContext } from '../shared/i18n/localeContext';
import { translate } from '../shared/i18n/messages';

interface AppErrorBoundaryProps {
  children: ReactNode;
}

interface AppErrorBoundaryState {
  hasError: boolean;
}

export class AppErrorBoundary extends Component<
  AppErrorBoundaryProps,
  AppErrorBoundaryState
> {
  static override contextType = LocaleContext;
  declare context: React.ContextType<typeof LocaleContext>;

  override state: AppErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): AppErrorBoundaryState {
    return { hasError: true };
  }

  override componentDidCatch(error: Error, info: ErrorInfo) {
    // Keep the failure visible in development without logging user data.
    if (import.meta.env.DEV) {
      console.error('Application render failed.', error, info.componentStack);
    }
  }

  override render() {
    if (this.state.hasError) {
      return (
        <main className="app-main" id="main-content" role="alert" tabIndex={-1}>
          <h1>{translate(this.context, 'appUnavailable')}</h1>
          <p>{translate(this.context, 'errorRecoveryDescription')}</p>
          <Button onClick={() => this.setState({ hasError: false })}>
            {translate(this.context, 'retry')}
          </Button>
        </main>
      );
    }

    return this.props.children;
  }
}
