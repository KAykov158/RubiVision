import type { ReactNode } from 'react';
import { BrowserRouter } from 'react-router';
import { AppErrorBoundary } from './AppErrorBoundary';
import { AppServicesProvider } from './AppServicesProvider';
import type { AppServices } from '../shared/domain/contracts';
import { LocaleProvider } from '../shared/i18n/LocaleProvider';
import { ThemeProvider } from '../shared/preferences/ThemeProvider';
import { AuthProvider } from '../features/auth/AuthProvider';
import { supabase } from '../shared/supabase/client';
import { createSupabaseAppServices } from '../shared/supabase/repositories';
import { TimerCompletionProvider } from '../features/timer/TimerCompletionProvider';

interface AppProvidersProps {
  children: ReactNode;
  services?: AppServices;
}

export function AppProviders({ children, services }: AppProvidersProps) {
  return (
    <LocaleProvider>
      <AuthProvider>
        <AppErrorBoundary>
          <AppServicesProvider services={services ?? (supabase ? createSupabaseAppServices(supabase) : undefined)}>
            <ThemeProvider>
              <BrowserRouter>
                <TimerCompletionProvider>{children}</TimerCompletionProvider>
              </BrowserRouter>
            </ThemeProvider>
          </AppServicesProvider>
        </AppErrorBoundary>
      </AuthProvider>
    </LocaleProvider>
  );
}
