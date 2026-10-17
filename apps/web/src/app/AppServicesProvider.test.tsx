import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { AppServices, ServiceResult } from '../shared/domain/contracts';
import { AppServicesProvider } from './AppServicesProvider';
import { useAppServices } from './useAppServices';

function ServicesStatus() {
  const state = useAppServices();

  return (
    <output>
      {state.status === 'ready' ? 'services-ready' : state.reason}
    </output>
  );
}

const unavailableResult = {
  status: 'unavailable',
  reason: 'NOT_CONFIGURED',
} as const satisfies ServiceResult<never>;

const contractMocks = {
  scrambles: {
    generate: vi.fn(async () => unavailableResult),
  },
  solves: {
    save: vi.fn(async () => unavailableResult),
    get: vi.fn(async () => unavailableResult),
    list: vi.fn(async () => unavailableResult),
    updatePenalty: vi.fn(async () => unavailableResult),
  },
  analysis: {
    analyze: vi.fn(async () => unavailableResult),
  },
} satisfies AppServices;

describe('AppServicesProvider', () => {
  it('exposes an explicit unavailable state when services are not configured', () => {
    render(
      <AppServicesProvider>
        <ServicesStatus />
      </AppServicesProvider>,
    );

    expect(screen.getByRole('status')).toHaveTextContent('NOT_CONFIGURED');
  });

  it('accepts the typed feature service contracts through injection', () => {
    render(
      <AppServicesProvider services={contractMocks}>
        <ServicesStatus />
      </AppServicesProvider>,
    );

    expect(screen.getByRole('status')).toHaveTextContent('services-ready');
  });
});
