import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { AppServices, ServiceResult } from '../shared/domain/contracts';
import { AppServicesProvider } from './AppServicesProvider';
import { useAppServices } from './useAppServices';
import { scrambleService } from '../features/scrambles/scrambleService';

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

  it('provides client-side scramble generation to guests without cloud repositories', () => {
    function GuestState() {
      const state = useAppServices();
      return <output>{state.status === 'unavailable' && state.scrambles === scrambleService
        ? 'guest-scrambles-ready' : 'missing'}</output>;
    }
    render(<AppServicesProvider><GuestState /></AppServicesProvider>);
    expect(screen.getByRole('status')).toHaveTextContent('guest-scrambles-ready');
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
