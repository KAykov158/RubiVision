import { createContext } from 'react';
import type { AppServices, ScrambleService, ServiceUnavailableReason } from '../shared/domain/contracts';

export type AppServicesState =
  | { status: 'ready'; services: AppServices; scrambles: ScrambleService }
  | { status: 'unavailable'; reason: ServiceUnavailableReason; scrambles?: ScrambleService };

const NOT_CONFIGURED: AppServicesState = {
  status: 'unavailable',
  reason: 'NOT_CONFIGURED',
};

export const AppServicesContext =
  createContext<AppServicesState>(NOT_CONFIGURED);
