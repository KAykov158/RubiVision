import type { ReactNode } from 'react';
import { BrowserRouter } from 'react-router';
import { AppErrorBoundary } from './AppErrorBoundary';
import { AppServicesProvider } from './AppServicesProvider';
import type { AppServices } from '../shared/domain/contracts';
import { LocaleProvider } from '../shared/i18n/LocaleProvider';
import { ThemeProvider } from '../shared/preferences/ThemeProvider';

interface AppProvidersProps {
  children: ReactNode;
  services?: AppServices;
}

export function AppProviders({ children, services }: AppProvidersProps) {
  return (
    <LocaleProvider>
      <AppErrorBoundary>
        <AppServicesProvider services={services}>
          <ThemeProvider>
            <BrowserRouter>{children}</BrowserRouter>
          </ThemeProvider>
        </AppServicesProvider>
      </AppErrorBoundary>
    </LocaleProvider>
  );
}
