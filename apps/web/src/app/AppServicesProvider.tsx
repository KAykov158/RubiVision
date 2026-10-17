import { useMemo, type ReactNode } from 'react';
import type { AppServices } from '../shared/domain/contracts';
import { AppServicesContext, type AppServicesState } from './appServicesContext';

interface AppServicesProviderProps {
  children: ReactNode;
  services?: AppServices;
}

export function AppServicesProvider({
  children,
  services,
}: AppServicesProviderProps) {
  const state = useMemo<AppServicesState>(
    () =>
      services
        ? { status: 'ready', services }
        : { status: 'unavailable', reason: 'NOT_CONFIGURED' },
    [services],
  );

  return (
    <AppServicesContext.Provider value={state}>
      {children}
    </AppServicesContext.Provider>
  );
}
