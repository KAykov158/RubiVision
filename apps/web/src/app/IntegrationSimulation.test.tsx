import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState, type ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';
import type { AppServices, ServiceResult, Solve } from '../shared/domain/contracts';
import { effectiveTimeMs } from '../shared/domain/effectiveTimeMs';
import { integrationFixtures, penaltySolveFixtures } from '../test/support/integrationFixtures';
import { createIntegrationServiceMocks } from '../test/support/integrationServiceMocks';
import { App } from './App';
import { AppProviders } from './AppProviders';

function TestOnlyTimerLifecycleProvider({ children }: { children: ReactNode }) {
  const [checkpoint, setCheckpoint] = useState(0);

  return (
    <div>
      <button onClick={() => setCheckpoint((value) => value + 1)} type="button">
        Advance test timer checkpoint
      </button>
      <output aria-label="Test timer lifecycle checkpoint">{checkpoint}</output>
      {children}
    </div>
  );
}

function renderApp(path: string, services?: AppServices) {
  window.history.replaceState(null, '', path);
  return render(
    <TestOnlyTimerLifecycleProvider>
      <AppProviders services={services}>
        <App />
      </AppProviders>
    </TestOnlyTimerLifecycleProvider>,
  );
}

describe('Prompt 18 integration rehearsal', () => {
  it('keeps the canonical fixture IDs, puzzle/session relationships, UTC timestamps, and penalty semantics coherent', () => {
    const { scramble, session, solve, recording, analysis } = integrationFixtures;

    expect(scramble.id).toMatch(/^[0-9a-f-]{36}$/i);
    expect(session.id).toMatch(/^[0-9a-f-]{36}$/i);
    expect(solve.id).toMatch(/^[0-9a-f-]{36}$/i);
    expect(analysis.id).toMatch(/^[0-9a-f-]{36}$/i);
    expect(solve.puzzle).toBe(scramble.puzzle);
    expect(solve.puzzle).toBe(session.puzzle);
    expect(solve.sessionId).toBe(session.id);
    expect(solve.scrambleId).toBe(scramble.id);
    expect(recording.solveId).toBe(solve.id);
    expect(analysis.solveId).toBe(solve.id);
    expect(analysis.recordingId).toBe(recording.id);
    expect([scramble.createdAt, session.createdAt, session.updatedAt, solve.startedAt, solve.completedAt]
      .every((timestamp) => /^\d{4}-\d{2}-\d{2}T.*Z$/.test(timestamp))).toBe(true);
    expect(Number.isInteger(solve.rawTimeMs)).toBe(true);
    expect(solve.rawTimeMs).toBeGreaterThanOrEqual(0);
    expect(effectiveTimeMs(penaltySolveFixtures.none)).toBe(30_420);
    expect(effectiveTimeMs(penaltySolveFixtures.plusTwo)).toBe(32_420);
    expect(effectiveTimeMs(penaltySolveFixtures.dnf)).toBeNull();
  });

  it('provides typed test doubles for all canonical services without defaulting to fabricated success', async () => {
    const services = createIntegrationServiceMocks();

    expect(await services.scrambles.generate('333')).toEqual({ status: 'unavailable', reason: 'NOT_CONFIGURED' });
    expect(await services.solves.save(integrationFixtures.solve)).toEqual({ status: 'unavailable', reason: 'NOT_CONFIGURED' });
    expect(await services.solves.get(integrationFixtures.solve.id)).toEqual({ status: 'unavailable', reason: 'NOT_CONFIGURED' });
    expect(await services.solves.list()).toEqual({ status: 'unavailable', reason: 'NOT_CONFIGURED' });
    expect(await services.solves.updatePenalty(integrationFixtures.solve.id, 'DNF'))
      .toEqual({ status: 'unavailable', reason: 'NOT_CONFIGURED' });
    expect(await services.analysis.analyze(integrationFixtures.recording.id))
      .toEqual({ status: 'unavailable', reason: 'NOT_CONFIGURED' });
  });

  it('can simulate typed service successes and an operation failure without adding production implementations', async () => {
    const services = createIntegrationServiceMocks({
      scrambles: {
        generate: async () => ({ status: 'success', data: integrationFixtures.scramble }),
      },
      solves: {
        list: async () => ({ status: 'success', data: [integrationFixtures.solve] }),
      },
      analysis: {
        analyze: async () => ({ status: 'error', code: 'UNKNOWN' as const }),
      },
    });

    expect(await services.scrambles.generate('333')).toEqual({
      status: 'success',
      data: integrationFixtures.scramble,
    });
    expect(await services.solves.list()).toEqual({ status: 'success', data: [integrationFixtures.solve] });
    expect(await services.analysis.analyze(integrationFixtures.recording.id))
      .toEqual({ status: 'error', code: 'UNKNOWN' });
  });

  it('renders injected solve success through the real Solves route boundary and keeps penalties explicit', async () => {
    const list = vi.fn(async (): Promise<ServiceResult<Solve[]>> => ({
      status: 'success',
      data: [integrationFixtures.solve],
    }));
    const services = createIntegrationServiceMocks({ solves: { list } });

    renderApp('/solves', services);

    expect(await screen.findByRole('table', {
      name: 'Solve records. Times include penalties in the effective time column.',
    })).toBeInTheDocument();
    const row = screen.getByRole('row', { name: /30\.42 s.*\+2.*32\.42 s/ });
    expect(row).toHaveTextContent('30.42 s');
    expect(row).toHaveTextContent('+2');
    expect(row).toHaveTextContent('32.42 s');
    expect(list).toHaveBeenCalledOnce();
  });

  it('shows the actual loading boundary before resolving a service response', async () => {
    let resolveList: ((result: ServiceResult<Solve[]>) => void) | undefined;
    const list = vi.fn(() => new Promise<ServiceResult<Solve[]>>((resolve) => { resolveList = resolve; }));
    const services = createIntegrationServiceMocks({ solves: { list } });

    renderApp('/solves', services);
    expect(screen.getByRole('region', { name: 'Loading solve history' })).toHaveAttribute('aria-busy', 'true');
    await waitFor(() => expect(list).toHaveBeenCalledOnce());

    await act(async () => {
      resolveList?.({ status: 'success', data: [integrationFixtures.solve] });
    });

    expect(await screen.findByRole('table', {
      name: 'Solve records. Times include penalties in the effective time column.',
    })).toBeInTheDocument();
  });

  it('keeps missing and failed services distinguishable and permits retry after rejection', async () => {
    const user = userEvent.setup();
    const list = vi.fn()
      .mockRejectedValueOnce(new Error('private service detail'))
      .mockResolvedValueOnce({ status: 'unavailable', reason: 'NETWORK_REQUIRED' });
    const services = createIntegrationServiceMocks({ solves: { list } });
    const { unmount } = renderApp('/solves', services);

    expect(await screen.findByRole('alert')).toHaveTextContent('The solve service returned an error.');
    expect(screen.queryByText('private service detail')).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Try again' }));
    expect(await screen.findByRole('heading', { name: 'Solve history unavailable' })).toBeInTheDocument();
    expect(list).toHaveBeenCalledTimes(2);

    unmount();
    renderApp('/solves');
    expect(await screen.findByRole('heading', { name: 'Solve history unavailable' })).toBeInTheDocument();
  });

  it('passes cancellation through the AnalysisService contract and preserves its explicit cancelled result', async () => {
    const controller = new AbortController();
    const analyze = vi.fn(async (_recordingId: string, options?: { signal?: AbortSignal }) => {
      expect(options?.signal).toBe(controller.signal);
      return { status: 'error', code: 'CANCELLED' } as const;
    });
    const services = createIntegrationServiceMocks({ analysis: { analyze } });

    controller.abort();
    await expect(services.analysis.analyze(integrationFixtures.recording.id, { signal: controller.signal }))
      .resolves.toEqual({ status: 'error', code: 'CANCELLED' });
    expect(analyze).toHaveBeenCalledOnce();
  });

  it('preserves test-only app-scoped state through Timer, Solves, Analyze and browser back navigation', async () => {
    const user = userEvent.setup();
    renderApp('/timer');

    await user.click(screen.getByRole('button', { name: 'Advance test timer checkpoint' }));
    expect(screen.getByLabelText('Test timer lifecycle checkpoint')).toHaveTextContent('1');

    await user.click(screen.getByRole('link', { name: 'Solves' }));
    expect(await screen.findByRole('heading', { name: 'Solves', level: 1 })).toBeInTheDocument();
    expect(screen.getByLabelText('Test timer lifecycle checkpoint')).toHaveTextContent('1');

    await user.click(screen.getByRole('link', { name: 'Analyze' }));
    expect(await screen.findByRole('heading', { name: 'Analyze', level: 1 })).toBeInTheDocument();
    expect(screen.getByLabelText('Test timer lifecycle checkpoint')).toHaveTextContent('1');

    act(() => window.history.back());
    await waitFor(() => expect(screen.getByRole('heading', { name: 'Solves', level: 1 })).toBeInTheDocument());
    expect(screen.getByLabelText('Test timer lifecycle checkpoint')).toHaveTextContent('1');

    act(() => window.history.back());
    await waitFor(() => expect(screen.getByRole('heading', { name: 'Timer', level: 1 })).toBeInTheDocument());
    expect(screen.getByLabelText('Test timer lifecycle checkpoint')).toHaveTextContent('1');
  });
});
