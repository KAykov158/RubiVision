import { createContext } from 'react';
import type { AppServices, ServiceUnavailableReason } from '../shared/domain/contracts';

export type AppServicesState =
  | { status: 'ready'; services: AppServices }
  | { status: 'unavailable'; reason: ServiceUnavailableReason };

const NOT_CONFIGURED: AppServicesState = {
  status: 'unavailable',
  reason: 'NOT_CONFIGURED',
};

export const AppServicesContext =
  createContext<AppServicesState>(NOT_CONFIGURED);
