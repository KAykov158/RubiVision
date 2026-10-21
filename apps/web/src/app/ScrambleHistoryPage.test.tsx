import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { useState } from 'react';
import { MemoryRouter } from 'react-router';
import { describe, expect, it, vi } from 'vitest';
import type { User } from '@supabase/supabase-js';
import type { AppServices, SavedScrambleHistoryEntry, ScrambleHistoryPage as ScrambleHistoryDataPage } from '../shared/domain/contracts';
import { AuthContext, type AuthContextValue } from '../features/auth/authContext';
import { AppServicesProvider } from './AppServicesProvider';
import { LocaleProvider } from '../shared/i18n/LocaleProvider';
import { ScrambleHistoryPage } from './ScrambleHistoryPage';

const ownerA = '11111111-1111-4111-8111-111111111111';
const ownerB = '99999999-9999-4999-8999-999999999999';
const entry: SavedScrambleHistoryEntry = {
  scramble: {
    id: '33333333-3333-4333-8333-333333333333',
    puzzle: '333',
    notation: "R  U\nR' ",
    generatorVersion: '0.66.1',
    generatorProvider: 'cubing.js',
    generationMethod: 'RANDOM_STATE',
    createdAt: '2026-10-18T12:00:00.000Z',
  },
  savedAt: '2026-10-19T10:00:00.000Z',
  solveId: '44444444-4444-4444-8444-444444444444',
};

function authValue(userId: string | null): AuthContextValue {
  return {
    status: userId ? 'signed-in' : 'signed-out',
    user: userId ? ({ id: userId } as User) : null,
    passwordRecovery: false,
    signUp: async () => null,
    signIn: async () => null,
    signOut: async () => null,
    sendPasswordReset: async () => null,
    updatePassword: async () => null,
  };
}

function makeServices(listHistory: NonNullable<AppServices['scrambleRepository']>['listHistory']) {
  const scrambleRepository: NonNullable<AppServices['scrambleRepository']> = {
    save: vi.fn(async () => ({ status: 'success' as const, data: undefined })),
    get: vi.fn(async () => ({ status: 'success' as const, data: null })),
    listHistory,
  };
  const services: AppServices = {
    scrambles: { generate: async () => ({ status: 'unavailable', reason: 'UNSUPPORTED' }) },
    scrambleRepository,
    solves: {
      save: async () => ({ status: 'success', data: undefined }),
      get: async () => ({ status: 'success', data: null }),
      list: async () => ({ status: 'success', data: [] }),
      updatePenalty: async () => ({ status: 'success', data: undefined }),
    },
    analysis: { analyze: async () => ({ status: 'unavailable', reason: 'UNSUPPORTED' }) },
  };
  return { services, scrambleRepository };
}

function renderHistory(userId: string | null, services: AppServices) {
  return render(<LocaleProvider>
    <AuthContext.Provider value={authValue(userId)}>
      <AppServicesProvider services={services}>
        <MemoryRouter><ScrambleHistoryPage /></MemoryRouter>
      </AppServicesProvider>
    </AuthContext.Provider>
  </LocaleProvider>);
}

describe('ScrambleHistoryPage', () => {
  it('shows an authentication-required state to guests without querying history', () => {
    const listHistory = vi.fn(async () => ({ status: 'success', data: { entries: [], nextCursor: null } } as const));
    const { services } = makeServices(listHistory);

    renderHistory(null, services);

    expect(screen.getByRole('heading', { name: 'Sign in to view saved scramble history' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Sign in' })).toBeInTheDocument();
    expect(listHistory).not.toHaveBeenCalled();
  });

  it('loads owner history, filters by puzzle, preserves exact notation on copy, and does not alter timer state', async () => {
    const listHistory = vi.fn(async () => ({ status: 'success', data: { entries: [entry], nextCursor: null } } as const));
    const { services } = makeServices(listHistory);
    const writeText = vi.fn(async () => undefined);
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } });
    render(<LocaleProvider>
      <AuthContext.Provider value={authValue(ownerA)}>
        <AppServicesProvider services={services}>
          <MemoryRouter><><output aria-label="Active timer scramble">ACTIVE-UNCHANGED</output><ScrambleHistoryPage /></></MemoryRouter>
        </AppServicesProvider>
      </AuthContext.Provider>
    </LocaleProvider>);

    expect((await screen.findByLabelText('Exact saved scramble notation')).textContent).toBe("R  U\nR' ");
    expect(listHistory).toHaveBeenCalledWith({ limit: 25 }, ownerA);
    expect(screen.getByText('Saved with solve')).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Puzzle'), { target: { value: '333' } });
    await waitFor(() => expect(listHistory).toHaveBeenLastCalledWith({ puzzle: '333', limit: 25 }, ownerA));
    fireEvent.click(screen.getByRole('button', { name: 'Copy notation' }));

    await waitFor(() => expect(writeText).toHaveBeenCalledWith("R  U\nR' "));
    expect(await screen.findByText('Exact scramble notation copied.')).toBeInTheDocument();
    expect(screen.getByLabelText('Active timer scramble')).toHaveTextContent('ACTIVE-UNCHANGED');
  });

  it('discards stale filter responses and shows the current puzzle only', async () => {
    let resolveAll!: (value: { status: 'success'; data: ScrambleHistoryDataPage }) => void;
    const listHistory = vi.fn((filter: { puzzle?: string }) => filter.puzzle === '333'
      ? Promise.resolve({ status: 'success' as const, data: { entries: [entry], nextCursor: null } })
      : new Promise<{ status: 'success'; data: ScrambleHistoryDataPage }>((resolve) => { resolveAll = resolve; }));
    const { services } = makeServices(listHistory as NonNullable<AppServices['scrambleRepository']>['listHistory']);
    renderHistory(ownerA, services);
    fireEvent.change(await screen.findByLabelText('Puzzle'), { target: { value: '333' } });
    expect((await screen.findByLabelText('Exact saved scramble notation')).textContent).toBe("R  U\nR' ");
    resolveAll({ status: 'success', data: { entries: [], nextCursor: null } });

    await waitFor(() => expect(screen.getByLabelText('Exact saved scramble notation').textContent).toBe("R  U\nR' "));
    expect(screen.queryByText('No saved scrambles yet')).not.toBeInTheDocument();
  });

  it('clears account A history before and after account switch', async () => {
    const entryForB = { ...entry, scramble: { ...entry.scramble, notation: "U2 F R'" }, solveId: '77777777-7777-4777-8777-777777777777' };
    const listHistory = vi.fn(async (_filter: unknown, activeOwner: string) => ({
      status: 'success' as const,
      data: { entries: [activeOwner === ownerA ? entry : entryForB], nextCursor: null },
    }));
    const { services } = makeServices(listHistory);
    function AccountHarness() {
      const [userId, setUserId] = useState(ownerA);
      return <LocaleProvider>
        <AuthContext.Provider value={authValue(userId)}>
          <AppServicesProvider services={services}>
            <MemoryRouter><button onClick={() => setUserId(ownerB)}>Switch account</button><ScrambleHistoryPage /></MemoryRouter>
          </AppServicesProvider>
        </AuthContext.Provider>
      </LocaleProvider>;
    }
    render(<AccountHarness />);
    expect((await screen.findByLabelText('Exact saved scramble notation')).textContent).toBe("R  U\nR' ");
    fireEvent.click(screen.getByRole('button', { name: 'Switch account' }));

    await waitFor(() => expect(listHistory).toHaveBeenLastCalledWith({ limit: 25 }, ownerB));
    expect((await screen.findByLabelText('Exact saved scramble notation')).textContent).toBe("U2 F R'");
    expect(listHistory).toHaveBeenCalledWith({ limit: 25 }, ownerA);
  });

  it('provides a retry for an initial history error', async () => {
    const listHistory = vi.fn()
      .mockResolvedValueOnce({ status: 'error', code: 'NETWORK' })
      .mockResolvedValueOnce({ status: 'success', data: { entries: [entry], nextCursor: null } });
    const { services } = makeServices(listHistory);
    renderHistory(ownerA, services);

    expect(await screen.findByRole('heading', { name: 'Scramble history could not be loaded' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Try again' }));
    expect((await screen.findByLabelText('Exact saved scramble notation')).textContent).toBe("R  U\nR' ");
  });

  it('shows an explicit empty state when the owner has no confirmed saved scrambles', async () => {
    const listHistory = vi.fn(async () => ({ status: 'success' as const, data: { entries: [], nextCursor: null } }));
    const { services } = makeServices(listHistory);
    renderHistory(ownerA, services);

    expect(await screen.findByRole('heading', { name: 'No saved scrambles yet' })).toBeInTheDocument();
  });

  it('loads a bounded next page and removes duplicate solve IDs at page boundaries', async () => {
    const secondEntry: SavedScrambleHistoryEntry = {
      ...entry,
      scramble: { ...entry.scramble, id: '88888888-8888-4888-8888-888888888888', notation: "U2 F R'" },
      solveId: '77777777-7777-4777-8777-777777777777',
    };
    const listHistory = vi.fn(async (filter: { cursor?: unknown }) => filter.cursor
      ? ({ status: 'success' as const, data: { entries: [entry, secondEntry], nextCursor: null } })
      : ({ status: 'success' as const, data: { entries: [entry], nextCursor: { savedAt: entry.savedAt, solveId: entry.solveId } } }));
    const { services } = makeServices(listHistory);
    renderHistory(ownerA, services);
    expect(await screen.findByLabelText('Exact saved scramble notation')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Load more saved scrambles' }));

    await waitFor(() => expect(screen.getAllByText('Saved with solve')).toHaveLength(2));
    expect(screen.getAllByLabelText('Exact saved scramble notation')).toHaveLength(2);
    expect(listHistory).toHaveBeenLastCalledWith(expect.objectContaining({ cursor: { savedAt: entry.savedAt, solveId: entry.solveId }, limit: 25 }), ownerA);
  });
});
