import { act, fireEvent, render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { BrowserRouter } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { User } from '@supabase/supabase-js';
import type { AppServices, Scramble, ServiceResult, Session, Solve } from '../shared/domain/contracts';
import { AuthContext, type AuthContextValue } from '../features/auth/authContext';
import { TimerCompletionProvider } from '../features/timer/TimerCompletionProvider';
import { useTimerCompletion, type TimerCompletion } from '../features/timer/timerCompletionContext';
import { AppServicesProvider } from './AppServicesProvider';
import { LocaleProvider } from '../shared/i18n/LocaleProvider';
import { TimerPageShell } from './TimerPage';

const ownerId = '11111111-1111-4111-8111-111111111111';
const session: Session = {
  id: '22222222-2222-4222-8222-222222222222',
  name: 'Practice',
  puzzle: '333',
  createdAt: '2026-10-18T12:00:00.000Z',
  updatedAt: '2026-10-18T12:00:00.000Z',
};
const testScramble: Scramble = {
  id: '33333333-3333-4333-8333-333333333333',
  puzzle: '333',
  notation: "R U R' U'",
  generatorVersion: 'test-fixture-v1',
  createdAt: '2026-10-18T12:00:00.000Z',
};

function makeServices(
  saveSolve: (solve: Solve) => Promise<ServiceResult<void>> = async () => ({ status: 'success', data: undefined }),
  options: { scramble?: Scramble | null; sessions?: Session[] } = {},
) {
  const generatedScramble = options.scramble === undefined ? testScramble : options.scramble;
  const availableSessions = options.sessions ?? [session];
  const solves = {
    save: vi.fn(saveSolve),
    get: vi.fn(async (id: string): Promise<ServiceResult<Solve | null>> => { void id; return { status: 'success', data: null }; }),
    list: vi.fn(async (): Promise<ServiceResult<Solve[]>> => ({ status: 'success', data: [] })),
    updatePenalty: vi.fn(async (id: string, penalty: Solve['penalty']): Promise<ServiceResult<void>> => { void id; void penalty; return { status: 'success', data: undefined }; }),
  } satisfies AppServices['solves'];
  const sessions = {
    list: vi.fn(async (): Promise<ServiceResult<Session[]>> => ({ status: 'success', data: availableSessions })),
    create: vi.fn(async (name: string, puzzle: Session['puzzle']): Promise<ServiceResult<Session>> => { void name; void puzzle; return { status: 'success', data: session }; }),
    archive: vi.fn(async (id: string): Promise<ServiceResult<void>> => { void id; return { status: 'success', data: undefined }; }),
  } satisfies NonNullable<AppServices['sessions']>;
  const scrambleRepository = {
    save: vi.fn(async (scramble: Scramble): Promise<ServiceResult<void>> => { void scramble; return { status: 'success', data: undefined }; }),
  } satisfies NonNullable<AppServices['scrambleRepository']>;
  const services: AppServices = {
    scrambles: { generate: async () => generatedScramble
      ? ({ status: 'success', data: generatedScramble })
      : ({ status: 'unavailable', reason: 'UNSUPPORTED' }) },
    scrambleRepository,
    solves,
    sessions,
    analysis: { analyze: async () => ({ status: 'unavailable', reason: 'UNSUPPORTED' }) },
  };
  return { services, solves, sessions, scrambleRepository };
}

function authValue(status: AuthContextValue['status']): AuthContextValue {
  const user = status === 'signed-in' ? ({ id: ownerId } as User) : null;
  return {
    status,
    user,
    passwordRecovery: false,
    signUp: async () => null,
    signIn: async () => null,
    signOut: async () => null,
    sendPasswordReset: async () => null,
    updatePassword: async () => null,
  };
}

function renderApp(status: AuthContextValue['status'], services: ReturnType<typeof makeServices>, child: ReactNode) {
  return {
    ...services,
    ...render(
      <LocaleProvider>
        <AuthContext.Provider value={authValue(status)}>
          <AppServicesProvider services={services.services}>
            <BrowserRouter>
              <TimerCompletionProvider>{child}</TimerCompletionProvider>
            </BrowserRouter>
          </AppServicesProvider>
        </AuthContext.Provider>
      </LocaleProvider>,
    ),
  };
}

function renderTimer(status: AuthContextValue['status'], services = makeServices()) {
  return renderApp(status, services, <TimerPageShell />);
}

function DuplicateCompletionButton({ completion }: { completion: TimerCompletion }) {
  const { complete } = useTimerCompletion();
  return <button onClick={() => { complete(completion); complete(completion); }} type="button">Complete twice</button>;
}

async function advance(milliseconds: number) {
  await act(async () => { await vi.advanceTimersByTimeAsync(milliseconds); });
}

async function flushPromises() {
  await act(async () => {
    await Promise.resolve();
    await Promise.resolve();
    await Promise.resolve();
    await Promise.resolve();
  });
}

async function completeSolve() {
  await flushPromises();
  const control = screen.getByRole('button', { name: 'Timer control' });
  fireEvent.pointerDown(control, { pointerId: 1, pointerType: 'touch', button: 0 });
  await advance(550);
  fireEvent.pointerUp(control, { pointerId: 1, pointerType: 'touch', button: 0 });
  await advance(1_234);
  fireEvent.pointerDown(control, { pointerId: 1, pointerType: 'touch', button: 0 });
  fireEvent.pointerUp(control, { pointerId: 1, pointerType: 'touch', button: 0 });
  await flushPromises();
}

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2026-10-18T12:00:00.000Z'));
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('timer-to-cloud-save slice', () => {
  it('keeps the timer public and retains a signed-out completion without claiming it was saved', async () => {
    const { solves } = renderTimer('signed-out');
    expect(screen.getByRole('heading', { name: 'Timer', level: 1 })).toBeInTheDocument();
    await flushPromises();
    expect(screen.getByRole('timer')).toHaveTextContent('00.00');
    expect(screen.queryByRole('button', { name: 'Start timer' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Stop timer' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Timer control' })).toBeEnabled();

    expect(screen.getByRole('combobox', { name: 'Puzzle type' })).toBeVisible();
    expect(screen.getByRole('combobox', { name: 'Session' })).toHaveTextContent('Sign in for sessions');
    expect(screen.queryByRole('textbox', { name: 'Exact scramble snapshot' })).not.toBeInTheDocument();
    expect(screen.getByText(testScramble.notation)).toBeInTheDocument();
    const control = screen.getByRole('button', { name: 'Timer control' });
    fireEvent.pointerDown(control, { pointerId: 1, pointerType: 'touch', button: 0 });
    await advance(550);
    fireEvent.pointerUp(control, { pointerId: 1, pointerType: 'touch', button: 0 });
    expect(control).toHaveAttribute('aria-pressed', 'true');
    await advance(800);
    expect(screen.getByRole('timer')).toHaveTextContent('00.80');
    fireEvent.pointerDown(control, { pointerId: 1, pointerType: 'touch', button: 0 });
    fireEvent.pointerUp(control, { pointerId: 1, pointerType: 'touch', button: 0 });
    await flushPromises();

    expect(screen.getByRole('heading', { name: 'Solve not saved' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Sign in to save this solve' })).toHaveAttribute('href', '/auth/sign-in');
    expect((screen.getByRole('textbox', { name: 'Volatile recovery data' }) as HTMLTextAreaElement).value).toContain(testScramble.notation);
    expect(solves.save).not.toHaveBeenCalled();
  });

  it('saves exact scramble, millisecond duration, UTC timestamps, session and stable UUID only after repository confirmation', async () => {
    const scrambleFixture = { ...testScramble, notation: "R2 U' F L" };
    const { solves, scrambleRepository } = renderTimer('signed-in', makeServices(undefined, { scramble: scrambleFixture }));
    await flushPromises();
    const control = screen.getByRole('button', { name: 'Timer control' });
    fireEvent.pointerDown(control, { pointerId: 1, pointerType: 'touch', button: 0 });
    await advance(550);
    fireEvent.pointerUp(control, { pointerId: 1, pointerType: 'touch', button: 0 });
    expect(screen.getByRole('combobox', { name: 'Puzzle type' })).toBeDisabled();
    expect(screen.getByRole('combobox', { name: 'Session' })).toBeDisabled();
    expect(screen.getByText(scrambleFixture.notation)).toBeInTheDocument();
    await advance(1_234);
    fireEvent.pointerDown(control, { pointerId: 1, pointerType: 'touch', button: 0 });
    fireEvent.pointerUp(control, { pointerId: 1, pointerType: 'touch', button: 0 });
    await flushPromises();

    expect(screen.getByRole('heading', { name: 'Saved' })).toBeInTheDocument();
    expect(scrambleRepository.save).toHaveBeenCalledTimes(1);
    const scramble = scrambleRepository.save.mock.calls.at(0)?.[0];
    const solve = solves.save.mock.calls.at(0)?.[0];
    if (!scramble || !solve) throw new Error('Expected confirmed scramble and solve calls.');
    expect(scramble).toEqual(scrambleFixture);
    expect(scramble.id).toMatch(/^[0-9a-f-]{36}$/i);
    expect(solve).toMatchObject({
      id: expect.stringMatching(/^[0-9a-f-]{36}$/i),
      sessionId: session.id,
      scrambleId: scramble.id,
      puzzle: '333',
      rawTimeMs: 1_234,
      penalty: 'NONE',
      startedAt: '2026-10-18T12:00:00.550Z',
      completedAt: '2026-10-18T12:00:01.784Z',
      timingSource: 'TOUCH',
    });
    expect(new Date(solve.startedAt).toISOString()).toBe(solve.startedAt);
    expect(new Date(solve.completedAt).toISOString()).toBe(solve.completedAt);
    expect(solves.save).toHaveBeenCalledTimes(1);
  });

  it('uses the explicitly selected session and never substitutes another session', async () => {
    const secondSession: Session = { ...session, id: '44444444-4444-4444-8444-444444444444', name: 'Evening' };
    const { solves } = renderTimer('signed-in', makeServices(undefined, { sessions: [session, secondSession] }));
    await flushPromises();
    const sessionSelector = screen.getByRole('combobox', { name: 'Session' });
    fireEvent.change(sessionSelector, { target: { value: secondSession.id } });
    await completeSolve();
    expect(solves.save.mock.calls[0]?.[0].sessionId).toBe(secondSession.id);
  });

  it('does not show Saved while the solve repository request is still pending', async () => {
    let confirmSave!: (result: ServiceResult<void>) => void;
    const saveSolve = vi.fn(() => new Promise<ServiceResult<void>>((resolve) => { confirmSave = resolve; }));
    renderTimer('signed-in', makeServices(saveSolve));
    await flushPromises();
    const control = screen.getByRole('button', { name: 'Timer control' });
    fireEvent.pointerDown(control, { pointerId: 1, pointerType: 'touch', button: 0 });
    await advance(550);
    fireEvent.pointerUp(control, { pointerId: 1, pointerType: 'touch', button: 0 });
    await advance(900);
    fireEvent.pointerDown(control, { pointerId: 1, pointerType: 'touch', button: 0 });
    fireEvent.pointerUp(control, { pointerId: 1, pointerType: 'touch', button: 0 });
    await flushPromises();

    expect(screen.getByRole('heading', { name: 'Saving solve' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Saved' })).not.toBeInTheDocument();
    await act(async () => { confirmSave({ status: 'success', data: undefined }); });
    await flushPromises();
    expect(screen.getByRole('heading', { name: 'Saved' })).toBeInTheDocument();
  });

  it('keeps a failed solve in memory and retries using the same solve and scramble UUIDs', async () => {
    const saveSolve = vi.fn()
      .mockResolvedValueOnce({ status: 'error', code: 'NETWORK', message: 'network error' } satisfies ServiceResult<void>)
      .mockResolvedValueOnce({ status: 'success', data: undefined } satisfies ServiceResult<void>);
    const { solves, scrambleRepository } = renderTimer('signed-in', makeServices(saveSolve));
    await completeSolve();

    expect(screen.getByRole('heading', { name: 'Solve not saved' })).toBeInTheDocument();
    expect(screen.getByText(/cloud service could not be reached/i)).toBeInTheDocument();
    const solveId = solves.save.mock.calls.at(0)?.[0].id;
    const scrambleId = scrambleRepository.save.mock.calls.at(0)?.[0].id;
    if (!solveId || !scrambleId) throw new Error('Expected an initial solve and scramble save attempt.');
    fireEvent.click(screen.getByRole('button', { name: 'Retry save' }));
    await flushPromises();

    expect(screen.getByRole('heading', { name: 'Saved' })).toBeInTheDocument();
    expect(solves.save.mock.calls.map(([solve]) => solve.id)).toEqual([solveId, solveId]);
    expect(scrambleRepository.save.mock.calls.map(([scramble]) => scramble.id)).toEqual([scrambleId, scrambleId]);
  });

  it('offers copy fallback data and a JSON download for an unsaved solve', async () => {
    const createObjectURL = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:recovery');
    renderTimer('signed-in', makeServices(async () => ({ status: 'error', code: 'NETWORK' })));
    await completeSolve();
    expect(screen.getByRole('heading', { name: 'Solve not saved' })).toBeInTheDocument();
    expect(createObjectURL).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Copy recovery data' }));
    expect(screen.getByText(/Select and copy the recovery data below/)).toBeInTheDocument();

    const revokeObjectURL = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => undefined);
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => undefined);
    fireEvent.click(screen.getByRole('button', { name: 'Download recovery file' }));
    expect(createObjectURL).toHaveBeenCalledWith(expect.any(Blob));
    await advance(1_000);
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:recovery');
  });

  it('does not persist an application database or browser storage when saving fails', async () => {
    const storageWrite = vi.spyOn(Storage.prototype, 'setItem');
    const indexedDbOpen = vi.fn();
    vi.stubGlobal('indexedDB', { open: indexedDbOpen });
    renderTimer('signed-in', makeServices(async () => ({ status: 'error', code: 'NETWORK' })));
    await completeSolve();

    expect(screen.getByRole('heading', { name: 'Solve not saved' })).toBeInTheDocument();
    expect(storageWrite).not.toHaveBeenCalled();
    expect(indexedDbOpen).not.toHaveBeenCalled();
  });

  it('ignores duplicate completion events for the same solve UUID', async () => {
    const duplicateServices = makeServices();
    const { solves } = duplicateServices;
    const completion: TimerCompletion = {
      solveId: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
      scramble: {
        id: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
        puzzle: '333',
        notation: 'R U',
        generatorVersion: 'test-fixture-v1',
        createdAt: '2026-10-18T12:00:00.000Z',
      },
      puzzle: '333',
      rawTimeMs: 1_000,
      penalty: 'NONE',
      startedAt: '2026-10-18T12:00:00.000Z',
      completedAt: '2026-10-18T12:00:01.000Z',
      timingSource: 'KEYBOARD',
    };
    renderApp('signed-in', duplicateServices, <DuplicateCompletionButton completion={completion} />);
    fireEvent.click(screen.getByRole('button', { name: 'Complete twice' }));
    await flushPromises();
    expect(solves.save).toHaveBeenCalledTimes(1);
    expect(solves.save.mock.calls.at(0)?.[0].id).toBe(completion.solveId);
  });

  it.each([
    ['FORBIDDEN', 'session may have expired'],
    ['RATE_LIMITED', 'Too many save requests'],
    ['NETWORK', 'cloud service could not be reached'],
  ] as const)('shows a safe recovery state for %s errors', async (code, message) => {
    renderTimer('signed-in', makeServices(async () => ({ status: 'error', code })));
    await completeSolve();
    expect(screen.getByRole('heading', { name: 'Solve not saved' })).toBeInTheDocument();
    expect(screen.getByText(new RegExp(message, 'i'))).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Download recovery file' })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Retry save' })).toBeEnabled();
  });

  it('keeps timing available when no real scramble exists and refuses fabricated persistence', async () => {
    const { solves, scrambleRepository } = renderTimer('signed-in', makeServices(undefined, { scramble: null }));
    await flushPromises();
    expect(screen.getByRole('timer')).toHaveTextContent('00.00');
    const control = screen.getByRole('button', { name: 'Timer control' });
    expect(control).toBeEnabled();
    expect(screen.queryByRole('textbox', { name: 'Exact scramble snapshot' })).not.toBeInTheDocument();
    fireEvent.pointerDown(control, { pointerId: 1, pointerType: 'touch', button: 0 });
    await advance(550);
    fireEvent.pointerUp(control, { pointerId: 1, pointerType: 'touch', button: 0 });
    await advance(650);
    fireEvent.pointerDown(control, { pointerId: 1, pointerType: 'touch', button: 0 });
    fireEvent.pointerUp(control, { pointerId: 1, pointerType: 'touch', button: 0 });
    await flushPromises();

    expect(screen.getByRole('timer')).toHaveTextContent('00.65');
    expect(screen.getByRole('heading', { name: 'Solve not saved' })).toBeInTheDocument();
    expect(screen.getByText(/No real scramble snapshot is available/i)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Retry save' })).not.toBeInTheDocument();
    expect(JSON.parse((screen.getByRole('textbox', { name: 'Volatile recovery data' }) as HTMLTextAreaElement).value)).toEqual(expect.objectContaining({ scramble: null }));
    expect(scrambleRepository.save).not.toHaveBeenCalled();
    expect(solves.save).not.toHaveBeenCalled();
  });

  it('shows the red hold state and cancels a Space press released before 550ms', async () => {
    const { solves } = renderTimer('signed-out');
    await flushPromises();
    fireEvent.keyDown(window, { code: 'Space', key: ' ' });
    expect(screen.getByRole('timer')).toHaveClass('timer-page__digits--holding');
    await advance(549);
    expect(screen.getByRole('timer')).not.toHaveClass('timer-page__digits--armed');
    fireEvent.keyUp(window, { code: 'Space', key: ' ' });
    await flushPromises();
    expect(screen.getByRole('timer')).toHaveTextContent('00.00');
    expect(screen.getByRole('timer')).not.toHaveClass('timer-page__digits--holding');
    expect(screen.queryByRole('heading', { name: 'Solve not saved' })).not.toBeInTheDocument();
    expect(solves.save).not.toHaveBeenCalled();
  });

  it('provides accessible touch hold-to-start and tap-to-stop from the timer display', async () => {
    const { solves } = renderTimer('signed-out');
    await flushPromises();
    const control = screen.getByRole('button', { name: 'Timer control' });
    expect(control).toHaveAttribute('aria-describedby', 'timer-touch-instructions');
    expect(control).toHaveAttribute('aria-keyshortcuts', 'Space');
    fireEvent.pointerDown(control, { pointerId: 4, pointerType: 'touch', button: 0 });
    expect(screen.getByRole('timer')).toHaveClass('timer-page__digits--holding');
    await advance(550);
    expect(screen.getByRole('timer')).toHaveClass('timer-page__digits--armed');
    expect(control).toHaveAttribute('aria-pressed', 'false');
    fireEvent.pointerUp(control, { pointerId: 4, pointerType: 'touch', button: 0 });
    expect(control).toHaveAttribute('aria-pressed', 'true');
    await advance(120);
    fireEvent.pointerDown(control, { pointerId: 4, pointerType: 'touch', button: 0 });
    fireEvent.pointerUp(control, { pointerId: 4, pointerType: 'touch', button: 0 });
    await flushPromises();
    expect(control).toHaveAttribute('aria-pressed', 'false');
    expect(screen.getByRole('heading', { name: 'Solve not saved' })).toBeInTheDocument();
    expect(solves.save).not.toHaveBeenCalled();
  });

  it('turns green at 550ms, starts on release, and stops on the next Space press without restarting on release', async () => {
    const { solves } = renderTimer('signed-out');
    await flushPromises();
    fireEvent.keyDown(window, { code: 'Space', key: ' ' });
    await advance(550);
    expect(screen.getByRole('timer')).toHaveClass('timer-page__digits--armed');
    expect(screen.getByRole('button', { name: 'Timer control' })).toHaveAttribute('aria-pressed', 'false');
    fireEvent.keyUp(window, { code: 'Space', key: ' ' });
    expect(screen.getByRole('timer')).not.toHaveClass('timer-page__digits--armed');
    expect(screen.getByRole('button', { name: 'Timer control' })).toHaveAttribute('aria-pressed', 'true');
    await advance(347);
    expect(screen.getByRole('timer')).toHaveTextContent('00.34');

    fireEvent.keyDown(window, { code: 'Space', key: ' ' });
    expect(screen.getByRole('button', { name: 'Timer control' })).toHaveAttribute('aria-pressed', 'false');
    fireEvent.keyUp(window, { code: 'Space', key: ' ' });
    await flushPromises();
    expect(screen.getByRole('heading', { name: 'Solve not saved' })).toBeInTheDocument();
    expect(screen.getByRole('timer')).toHaveTextContent('00.34');
    expect(solves.save).not.toHaveBeenCalled();
  });

  it('ignores Space auto-repeat and does not start while focus is in an editable control', async () => {
    const services = makeServices();
    const { solves } = renderApp('signed-in', services, <>
      <TimerPageShell />
      <input aria-label="Text entry" />
    </>);
    await flushPromises();
    const input = screen.getByRole('textbox', { name: 'Text entry' });
    fireEvent.keyDown(input, { code: 'Space', key: ' ' });
    await advance(600);
    fireEvent.keyUp(input, { code: 'Space', key: ' ' });
    expect(screen.getByRole('timer')).toHaveTextContent('00.00');
    expect(screen.getByRole('timer')).not.toHaveClass('timer-page__digits--holding');
    expect(screen.getByRole('button', { name: 'Timer control' })).toHaveAttribute('aria-pressed', 'false');

    fireEvent.keyDown(window, { code: 'Space', key: ' ' });
    fireEvent.keyDown(window, { code: 'Space', key: ' ', repeat: true });
    await advance(550);
    expect(screen.getByRole('timer')).toHaveClass('timer-page__digits--armed');
    fireEvent.keyUp(window, { code: 'Space', key: ' ' });
    expect(screen.getByRole('button', { name: 'Timer control' })).toHaveAttribute('aria-pressed', 'true');
    await advance(210);
    fireEvent.keyDown(window, { code: 'Space', key: ' ' });
    fireEvent.keyDown(window, { code: 'Space', key: ' ', repeat: true });
    fireEvent.keyUp(window, { code: 'Space', key: ' ' });
    await flushPromises();
    expect(solves.save).toHaveBeenCalledTimes(1);
    expect(solves.save.mock.calls[0]?.[0]).toMatchObject({
      timingSource: 'KEYBOARD',
      rawTimeMs: 210,
      scrambleId: testScramble.id,
      sessionId: session.id,
    });
  });

  it('cancels an incomplete hold on window blur and unmount', async () => {
    const services = makeServices();
    const { unmount } = renderTimer('signed-in', services);
    await flushPromises();
    fireEvent.keyDown(window, { code: 'Space', key: ' ' });
    await advance(200);
    fireEvent.blur(window);
    fireEvent.keyUp(window, { code: 'Space', key: ' ' });
    expect(screen.getByRole('timer')).toHaveTextContent('00.00');
    expect(screen.getByRole('button', { name: 'Timer control' })).toHaveAttribute('aria-pressed', 'false');

    fireEvent.keyDown(window, { code: 'Space', key: ' ' });
    unmount();
    await advance(600);
    expect(services.solves.save).not.toHaveBeenCalled();
  });
});
