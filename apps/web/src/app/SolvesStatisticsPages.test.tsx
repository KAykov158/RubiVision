import { act, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import type { AppServices, Solve, SolveListFilter } from '../shared/domain/contracts';
import { App } from './App';
import { AppProviders } from './AppProviders';

const solve = (overrides: Partial<Solve> = {}): Solve => ({
  id: 'solve-1', sessionId: 'session-1', scrambleId: 'scramble-1', puzzle: '333', rawTimeMs: 12_340,
  penalty: 'PLUS_TWO', startedAt: '2026-10-15T10:00:00.000Z', completedAt: '2026-10-15T10:00:12.340Z',
  timingSource: 'KEYBOARD', ...overrides,
});

function servicesFor(list: AppServices['solves']['list']): AppServices {
  return { solves: { list, save: vi.fn(), get: vi.fn(), updatePenalty: vi.fn() }, scrambles: { generate: vi.fn() }, analysis: { analyze: vi.fn() } } as AppServices;
}

function renderRoute(path: string, services?: AppServices) {
  window.history.replaceState(null, '', path);
  return render(<AppProviders services={services}><App /></AppProviders>);
}

describe('Solves page shell', () => {
  it('shows an explicit unavailable state when no solve service is configured', () => {
    renderRoute('/solves');
    expect(screen.getByRole('heading', { name: 'Solves', level: 1 })).toBeInTheDocument();
    expect(screen.getByText(/Solve history is unavailable until its data service/)).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: 'Session' })).toBeDisabled();
  });

  it('renders an empty response without fabricating solve rows', async () => {
    const list = vi.fn().mockResolvedValue({ status: 'success', data: [] });
    renderRoute('/solves', servicesFor(list));
    expect(await screen.findByText('No solve records are available for this view. Completed solves will appear here when provided by the solve service.')).toBeInTheDocument();
    expect(screen.queryByRole('row')).not.toBeInTheDocument();
  });

  it('displays real service records, penalty-adjusted time, sorting and date filters', async () => {
    const rows = [solve({ id: 'slower', rawTimeMs: 13_000, penalty: 'NONE', completedAt: '2026-10-14T10:00:00.000Z' }), solve({ id: 'faster', rawTimeMs: 12_340, penalty: 'PLUS_TWO', completedAt: '2026-10-15T10:00:12.340Z', scrambleId: 'R U R\' U\' '.repeat(20) }), solve({ id: 'dnf', penalty: 'DNF' })];
    const list = vi.fn().mockResolvedValue({ status: 'success', data: rows });
    const user = userEvent.setup();
    renderRoute('/solves', servicesFor(list));
    const table = await screen.findByRole('table', { name: /Solve records/ });
    expect(within(table).getByText('+2 seconds')).toBeInTheDocument();
    expect(within(table).getByText('14.34 s')).toBeInTheDocument();
    expect(within(table).getAllByText('DNF')).toHaveLength(2);
    expect(within(table).getByText(/R U R/)).toBeInTheDocument();
    await user.selectOptions(screen.getByRole('combobox', { name: 'Sort by' }), 'fastest');
    expect(within(table).getAllByRole('row')[1]).toHaveTextContent('13.00 s');
    await user.type(screen.getByRole('searchbox'), 'missing');
    expect(await screen.findByText('No matching solves')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Clear filters' }));
    expect(await screen.findByRole('table', { name: /Solve records/ })).toBeInTheDocument();
  });

  it('shows a retryable error and retries through the solve service', async () => {
    const list = vi.fn().mockResolvedValueOnce({ status: 'error', code: 'UNKNOWN' }).mockResolvedValueOnce({ status: 'success', data: [] });
    const user = userEvent.setup();
    renderRoute('/solves', servicesFor(list));
    expect(await screen.findByText('The solve service returned an error. Try again when it is available.')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Try again' }));
    expect(await screen.findByText(/No solve records are available/)).toBeInTheDocument();
    expect(list).toHaveBeenCalledTimes(2);
  });

  it('treats malformed and unexpected service results as errors instead of rendering invalid records', async () => {
    const list = vi.fn()
      .mockResolvedValueOnce({ status: 'success', data: [{ id: 'incomplete' }] })
      .mockResolvedValueOnce({ status: 'future-status', data: [] })
      .mockResolvedValueOnce({ status: 'success', data: [] });
    const user = userEvent.setup();
    renderRoute('/solves', servicesFor(list));

    expect(await screen.findByText('The solve service returned an error. Try again when it is available.')).toBeInTheDocument();
    expect(screen.queryByRole('row')).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Try again' }));
    expect(await screen.findByText('The solve service returned an error. Try again when it is available.')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Try again' }));
    expect(await screen.findByText(/No solve records are available/)).toBeInTheDocument();
  });

  it('handles a rejected solve request and exposes a working retry', async () => {
    const list = vi.fn().mockRejectedValueOnce(new Error('network details are not shown'))
      .mockResolvedValueOnce({ status: 'success', data: [] });
    const user = userEvent.setup();
    renderRoute('/solves', servicesFor(list));

    expect(await screen.findByRole('alert')).toHaveTextContent('The solve service returned an error.');
    expect(screen.queryByText('network details are not shown')).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Try again' }));
    expect(await screen.findByText(/No solve records are available/)).toBeInTheDocument();
  });

  it('ignores a stale response after a new filter request has completed', async () => {
    let resolveFirst: ((value: { status: 'success'; data: Solve[] }) => void) | undefined;
    const list = vi.fn((filter?: SolveListFilter) => filter?.puzzle
      ? Promise.resolve({ status: 'success' as const, data: [] })
      : new Promise<{ status: 'success'; data: Solve[] }>((resolve) => { resolveFirst = resolve; }));
    const user = userEvent.setup();
    renderRoute('/solves', servicesFor(list));
    await waitFor(() => expect(list).toHaveBeenCalledOnce());

    await user.selectOptions(screen.getByRole('combobox', { name: 'Puzzle' }), '333');
    expect(await screen.findByText('No solve records yet')).toBeInTheDocument();
    await act(async () => {
      resolveFirst?.({ status: 'success', data: [solve({ id: 'stale' })] });
      await Promise.resolve();
    });
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    expect(screen.getByText('No solve records yet')).toBeInTheDocument();
  });

  it('announces loading while a service request is pending', async () => {
    let resolve: ((value: { status: 'success'; data: Solve[] }) => void) | undefined;
    const list = vi.fn(() => new Promise<{ status: 'success'; data: Solve[] }>((done) => { resolve = done; }));
    renderRoute('/solves', servicesFor(list));
    expect(screen.getByRole('region', { name: 'Loading solve history' })).toHaveAttribute('aria-busy', 'true');
    await waitFor(() => expect(list).toHaveBeenCalledOnce());
    resolve?.({ status: 'success', data: [] });
    await waitFor(() => expect(screen.getByText('No solve records yet')).toBeInTheDocument());
  });
});

describe('Statistics page shell', () => {
  it('provides labeled summaries and an accessible empty chart table without invented values', () => {
    renderRoute('/statistics');
    expect(screen.getByRole('heading', { name: 'Statistics', level: 1 })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Best' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Average of 5' })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: /Trend chart unavailable/ })).toBeInTheDocument();
    const table = screen.getByRole('table', { name: 'Accessible trend data table' });
    expect(within(table).getByRole('columnheader', { name: 'Date' })).toBeInTheDocument();
    expect(within(table).getByRole('cell', { name: /No statistics are shown/ })).toBeInTheDocument();
    expect(screen.getAllByText('Not calculated').length).toBe(4);
    expect(screen.getByRole('combobox', { name: 'Puzzle' })).toBeDisabled();
  });

  it('keeps unavailable filters concise, disabled, and described by one shared explanation', () => {
    renderRoute('/statistics');

    const explanation = screen.getByText('Filters unavailable until statistics services are connected');
    expect(explanation).toHaveAttribute('id', 'statistics-filters-hint');
    expect(screen.getAllByText('Filters unavailable until statistics services are connected')).toHaveLength(1);

    for (const name of ['Puzzle', 'Session', 'Date range']) {
      const filter = screen.getByRole('combobox', { name });
      expect(filter).toBeDisabled();
      expect(filter).toHaveAttribute('aria-describedby', 'statistics-filters-hint');
      expect(within(filter).getByRole('option')).toHaveTextContent('Unavailable');
    }
  });

  it('supports route navigation between Solves and Statistics', async () => {
    const user = userEvent.setup();
    renderRoute('/solves');
    await user.click(screen.getByRole('link', { name: 'Statistics' }));
    await waitFor(() => expect(screen.getByRole('heading', { name: 'Statistics', level: 1 })).toBeInTheDocument());
    expect(window.location.pathname).toBe('/statistics');
  });
});
