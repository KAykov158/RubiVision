import { useMemo, type ReactNode } from 'react';
import type { AppServices } from '../shared/domain/contracts';
import { scrambleService } from '../features/scrambles/scrambleService';
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
        ? { status: 'ready', services, scrambles: services.scrambles }
        : { status: 'unavailable', reason: 'NOT_CONFIGURED', scrambles: scrambleService },
    [services],
  );

  return (
    <AppServicesContext.Provider value={state}>
      {children}
    </AppServicesContext.Provider>
  );
}
