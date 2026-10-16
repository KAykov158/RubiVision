import { useContext } from 'react';
import { AppServicesContext } from './appServicesContext';

export function useAppServices() {
  return useContext(AppServicesContext);
}
