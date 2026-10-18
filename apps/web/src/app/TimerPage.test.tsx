import { act, fireEvent, render, screen } from '@testing-library/react';
import { useState, type ReactNode } from 'react';
import { BrowserRouter } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { User } from '@supabase/supabase-js';
import type { AppServices, Scramble, ScrambleService, ServiceResult, Session, Solve } from '../shared/domain/contracts';
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
  options: { scramble?: Scramble | null; sessions?: Session[]; generate?: ScrambleService['generate'] } = {},
) {
  const generatedScramble = options.scramble === undefined ? testScramble : options.scramble;
  const availableSessions = options.sessions ?? [session];
  const solves = {
    save: vi.fn((solve: Solve, expectedOwnerId?: string) => { void expectedOwnerId; return saveSolve(solve); }),
    get: vi.fn(async (id: string): Promise<ServiceResult<Solve | null>> => { void id; return { status: 'success', data: null }; }),
    list: vi.fn(async (): Promise<ServiceResult<Solve[]>> => ({ status: 'success', data: [] })),
    updatePenalty: vi.fn(async (id: string, penalty: Solve['penalty']): Promise<ServiceResult<void>> => { void id; void penalty; return { status: 'success', data: undefined }; }),
  } satisfies AppServices['solves'];
  const sessions = {
    list: vi.fn(async (expectedOwnerId?: string): Promise<ServiceResult<Session[]>> => { void expectedOwnerId; return { status: 'success', data: availableSessions }; }),
    create: vi.fn(async (name: string, puzzle: Session['puzzle'], expectedOwnerId?: string): Promise<ServiceResult<Session>> => { void name; void puzzle; void expectedOwnerId; return { status: 'success', data: session }; }),
    archive: vi.fn(async (id: string): Promise<ServiceResult<void>> => { void id; return { status: 'success', data: undefined }; }),
  } satisfies NonNullable<AppServices['sessions']>;
  const scrambleRepository = {
    save: vi.fn(async (scramble: Scramble, expectedOwnerId?: string): Promise<ServiceResult<void>> => { void scramble; void expectedOwnerId; return { status: 'success', data: undefined }; }),
    get: vi.fn(async () => ({ status: 'success', data: null } as const)),
    listHistory: vi.fn(async () => ({ status: 'success', data: { entries: [], nextCursor: null } } as const)),
  } satisfies NonNullable<AppServices['scrambleRepository']>;
  const services: AppServices = {
    scrambles: { generate: options.generate ?? (async () => generatedScramble
      ? ({ status: 'success', data: generatedScramble })
      : ({ status: 'unavailable', reason: 'UNSUPPORTED' })) },
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

function TimerSnapshotProbe() {
  const { activeRun, pending } = useTimerCompletion();
  const scramble = activeRun?.scramble ?? pending?.completion.scramble ?? null;
  return <output data-testid="scramble-snapshot-probe">{JSON.stringify({
    frozen: scramble ? Object.isFrozen(scramble) : false,
    id: scramble?.id,
    puzzle: scramble?.puzzle,
    notation: scramble?.notation,
    generatorVersion: scramble?.generatorVersion,
    generatorProvider: scramble?.generatorProvider,
    generationMethod: scramble?.generationMethod,
  })}</output>;
}

function TimerRouteHarness() {
  const [showTimer, setShowTimer] = useState(true);
  return <>
    <button onClick={() => setShowTimer((show) => !show)} type="button">Toggle timer route</button>
    {showTimer ? <TimerPageShell /> : <p>Another route</p>}
  </>;
}

function AccountSwitchingProviders({ services, children, initialUserId = ownerId }: { services: ReturnType<typeof makeServices>; children: ReactNode; initialUserId?: string | null }) {
  const [userId, setUserId] = useState<string | null>(initialUserId);
  const value: AuthContextValue = {
    ...authValue(userId ? 'signed-in' : 'signed-out'),
    user: userId ? { id: userId } as User : null,
  };
  return <LocaleProvider>
    <AuthContext.Provider value={value}>
      <button onClick={() => setUserId((current) => current === ownerId ? '99999999-9999-4999-8999-999999999999' : current ? ownerId : ownerId)} type="button">Switch account</button>
      <AppServicesProvider services={services.services}>
        <BrowserRouter><TimerCompletionProvider>{children}</TimerCompletionProvider></BrowserRouter>
      </AppServicesProvider>
    </AuthContext.Provider>
  </LocaleProvider>;
}

function renderWithAccountSwitch(services: ReturnType<typeof makeServices>, child: ReactNode, initialUserId?: string | null) {
  return { ...services, ...render(<AccountSwitchingProviders initialUserId={initialUserId} services={services}>{child}</AccountSwitchingProviders>) };
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
  it.each(['222', '333', '444', '555', '666', '777'] as const)('selects %s and displays its matching scramble', async (puzzle) => {
    const generate = vi.fn(async (puzzle: Scramble['puzzle']): Promise<ServiceResult<Scramble>> => ({
      status: 'success', data: { ...testScramble, puzzle, notation: `scramble for ${puzzle}` },
    }));
    renderTimer('signed-out', makeServices(undefined, { generate }));
    await flushPromises();
    const selector = screen.getByRole('combobox', { name: 'Puzzle type' });
    expect(Array.from((selector as HTMLSelectElement).options).map((option) => option.value))
      .toEqual(['222', '333', '444', '555', '666', '777']);
    expect(Array.from((selector as HTMLSelectElement).options).map((option) => option.textContent))
      .toEqual(['2×2', '3×3', '4×4', '5×5', '6×6', '7×7']);
    if (puzzle !== '333') fireEvent.change(selector, { target: { value: puzzle } });
    await flushPromises();
    expect(screen.getByText('scramble for ' + puzzle)).toBeInTheDocument();
    expect(screen.getByText('Generated scramble · temporary until a completed solve is confirmed and saved.')).toBeInTheDocument();
    expect((selector as HTMLSelectElement).value).toBe(puzzle);
    expect(generate).toHaveBeenLastCalledWith(puzzle, expect.objectContaining({ signal: expect.any(AbortSignal) }));
  });

  it('regenerates explicitly, hides the previous notation while loading, and reports completion', async () => {
    const fresh = { ...testScramble, id: '44444444-4444-4444-8444-444444444444', notation: 'FRESH R U' };
    let finish!: (result: ServiceResult<Scramble>) => void;
    const generate = vi.fn()
      .mockResolvedValueOnce({ status: 'success', data: testScramble } satisfies ServiceResult<Scramble>)
      .mockImplementationOnce(() => new Promise<ServiceResult<Scramble>>((resolve) => { finish = resolve; }));
    renderTimer('signed-out', makeServices(undefined, { generate }));
    await flushPromises();
    const newScrambleButton = screen.getByRole('button', { name: 'New Scramble' });
    fireEvent.click(newScrambleButton);
    expect(newScrambleButton).toBeDisabled();
    fireEvent.click(newScrambleButton);
    await flushPromises();
    expect(generate).toHaveBeenCalledTimes(2);
    expect(screen.queryByText(testScramble.notation)).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Timer control' })).toBeDisabled();
    finish({ status: 'success', data: fresh });
    await flushPromises();
    expect(screen.getByText(fresh.notation)).toBeInTheDocument();
    expect(screen.getByText('Ready')).toBeInTheDocument();
    expect(generate).toHaveBeenCalledTimes(2);
  });

  it('shows generation failure, offers retry, and prevents timer start until retry succeeds', async () => {
    const generate = vi.fn()
      .mockResolvedValueOnce({ status: 'error', code: 'UNKNOWN' } satisfies ServiceResult<Scramble>)
      .mockResolvedValueOnce({ status: 'success', data: testScramble } satisfies ServiceResult<Scramble>);
    renderTimer('signed-out', makeServices(undefined, { generate }));
    await flushPromises();
    expect(screen.getByText('Could not generate this scramble. Try again.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Retry Scramble' })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Timer control' })).toBeDisabled();
    fireEvent.keyDown(window, { code: 'Space', key: ' ' });
    await advance(600);
    fireEvent.keyUp(window, { code: 'Space', key: ' ' });
    expect(screen.getByRole('timer')).toHaveTextContent('00.00');
    fireEvent.click(screen.getByRole('button', { name: 'Retry Scramble' }));
    await flushPromises();
    expect(screen.getByText(testScramble.notation)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Timer control' })).toBeEnabled();
  });

  it('ignores a stale response after the selected puzzle changes', async () => {
    let finishOld!: (result: ServiceResult<Scramble>) => void;
    const signals: AbortSignal[] = [];
    const generate = vi.fn((puzzle: Scramble['puzzle'], options?: { signal?: AbortSignal }): Promise<ServiceResult<Scramble>> => {
      if (options?.signal) signals.push(options.signal);
      return puzzle === '333'
        ? new Promise<ServiceResult<Scramble>>((resolve) => { finishOld = resolve; })
        : Promise.resolve<ServiceResult<Scramble>>({ status: 'success', data: { ...testScramble, puzzle: '222', notation: 'ONLY 222' } });
    });
    renderTimer('signed-out', makeServices(undefined, { generate }));
    await Promise.resolve();
    fireEvent.change(screen.getByRole('combobox', { name: 'Puzzle type' }), { target: { value: '222' } });
    expect(signals[0]?.aborted).toBe(true);
    await flushPromises();
    finishOld({ status: 'success', data: testScramble });
    await flushPromises();
    expect(screen.getByText('ONLY 222')).toBeInTheDocument();
    expect(screen.queryByText(testScramble.notation)).not.toBeInTheDocument();
  });

  it('rejects a generated scramble for the wrong puzzle and keeps timer start disabled', async () => {
    const generate = vi.fn(async (): Promise<ServiceResult<Scramble>> => ({
      status: 'success', data: { ...testScramble, puzzle: '222', notation: 'WRONG PUZZLE' },
    }));
    renderTimer('signed-out', makeServices(undefined, { generate }));
    await flushPromises();
    expect(screen.getByText('Could not generate this scramble. Try again.')).toBeInTheDocument();
    expect(screen.queryByText('WRONG PUZZLE')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Timer control' })).toBeDisabled();
  });

  it('does not mark a scramble ready when its snapshot identity is malformed', async () => {
    const generate = vi.fn(async (): Promise<ServiceResult<Scramble>> => ({
      status: 'success', data: { ...testScramble, id: '' },
    }));
    renderTimer('signed-out', makeServices(undefined, { generate }));
    await flushPromises();
    expect(screen.getByText('Could not generate this scramble. Try again.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Timer control' })).toBeDisabled();
  });

  it('freezes the run snapshot and displays and saves that exact scramble after source mutation', async () => {
    const sourceScramble: Scramble = {
      ...testScramble,
      notation: "R U R' U'",
      generatorProvider: 'cubing',
      generationMethod: 'RANDOM_STATE',
    };
    const expectedSnapshot = { ...sourceScramble };
    const services = makeServices(undefined, { scramble: sourceScramble });
    const { solves, scrambleRepository } = renderApp('signed-in', services, <>
      <TimerPageShell />
      <TimerSnapshotProbe />
    </>);
    await flushPromises();
    const control = screen.getByRole('button', { name: 'Timer control' });
    fireEvent.pointerDown(control, { pointerId: 1, pointerType: 'touch', button: 0 });
    expect(screen.getByRole('combobox', { name: 'Puzzle type' })).toBeDisabled();
    await advance(550);
    fireEvent.pointerUp(control, { pointerId: 1, pointerType: 'touch', button: 0 });
    expect(JSON.parse(screen.getByTestId('scramble-snapshot-probe').textContent ?? '{}')).toEqual({
      frozen: true,
      id: expectedSnapshot.id,
      puzzle: expectedSnapshot.puzzle,
      notation: expectedSnapshot.notation,
      generatorVersion: expectedSnapshot.generatorVersion,
      generatorProvider: expectedSnapshot.generatorProvider,
      generationMethod: expectedSnapshot.generationMethod,
    });

    Object.assign(sourceScramble, { id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', notation: 'MUTATED AFTER START' });
    expect(screen.getByText(expectedSnapshot.notation)).toBeInTheDocument();
    expect(screen.queryByText('MUTATED AFTER START')).not.toBeInTheDocument();
    await advance(1_234);
    fireEvent.pointerDown(control, { pointerId: 1, pointerType: 'touch', button: 0 });
    fireEvent.pointerUp(control, { pointerId: 1, pointerType: 'touch', button: 0 });
    await flushPromises();
    expect(scrambleRepository.save).toHaveBeenCalledWith(expectedSnapshot, ownerId);
    expect(solves.save.mock.calls[0]?.[0]).toMatchObject({
      scrambleId: expectedSnapshot.id,
      puzzle: expectedSnapshot.puzzle,
    });
  });

  it('keeps the captured scramble visible across timer route unmount and return', async () => {
    const generate = vi.fn(async (puzzle: Scramble['puzzle']): Promise<ServiceResult<Scramble>> => ({
      status: 'success', data: { ...testScramble, puzzle, notation: `captured ${puzzle}` },
    }));
    let confirmSave!: (result: ServiceResult<void>) => void;
    const services = makeServices(() => new Promise<ServiceResult<void>>((resolve) => { confirmSave = resolve; }), { generate });
    renderApp('signed-in', services, <TimerRouteHarness />);
    await flushPromises();
    fireEvent.change(screen.getByRole('combobox', { name: 'Puzzle type' }), { target: { value: '777' } });
    await flushPromises();
    expect(screen.getByText('captured 777')).toBeInTheDocument();
    const control = screen.getByRole('button', { name: 'Timer control' });
    fireEvent.pointerDown(control, { pointerId: 3, pointerType: 'touch', button: 0 });
    await advance(550);
    fireEvent.pointerUp(control, { pointerId: 3, pointerType: 'touch', button: 0 });
    fireEvent.click(screen.getByRole('button', { name: 'Toggle timer route' }));
    expect(screen.getByText('Another route')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Toggle timer route' }));
    await flushPromises();
    expect(screen.getByRole('combobox', { name: 'Puzzle type' })).toBeDisabled();
    expect((screen.getByRole('combobox', { name: 'Puzzle type' }) as HTMLSelectElement).value).toBe('777');
    expect(screen.getByText('captured 777')).toBeInTheDocument();
    await advance(321);
    fireEvent.pointerDown(screen.getByRole('button', { name: 'Timer control' }), { pointerId: 3, pointerType: 'touch', button: 0 });
    fireEvent.pointerUp(screen.getByRole('button', { name: 'Timer control' }), { pointerId: 3, pointerType: 'touch', button: 0 });
    await flushPromises();
    expect(screen.getByRole('heading', { name: 'Saving solve' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Toggle timer route' }));
    fireEvent.click(screen.getByRole('button', { name: 'Toggle timer route' }));
    await flushPromises();
    expect(screen.getByText('captured 777')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Saving solve' })).toBeInTheDocument();
    await act(async () => { confirmSave({ status: 'success', data: undefined }); });
  });

  it('copies exact notation and reports clipboard denial without a fallback write', async () => {
    const writeText = vi.fn(async () => undefined);
    vi.stubGlobal('navigator', { ...navigator, clipboard: { writeText } });
    renderTimer('signed-out');
    await flushPromises();
    fireEvent.click(screen.getByRole('button', { name: 'Copy Scramble' }));
    await flushPromises();
    expect(writeText).toHaveBeenCalledWith(testScramble.notation);
    expect(screen.getByText('Scramble copied.')).toBeInTheDocument();

    writeText.mockRejectedValueOnce(new Error('permission denied'));
    fireEvent.click(screen.getByRole('button', { name: 'Copy Scramble' }));
    await flushPromises();
    expect(screen.getByText('Could not copy. Check browser clipboard access and try again.')).toBeInTheDocument();
    vi.stubGlobal('navigator', { ...navigator, clipboard: undefined });
    fireEvent.click(screen.getByRole('button', { name: 'Copy Scramble' }));
    await flushPromises();
    expect(screen.getByText('Could not copy. Check browser clipboard access and try again.')).toBeInTheDocument();
  });

  it('keeps the timer public and retains a signed-out completion without claiming it was saved', async () => {
    const { solves } = renderTimer('signed-out');
    expect(screen.getByRole('heading', { name: 'Timer', level: 1 })).toBeInTheDocument();
    await flushPromises();
    expect(screen.getByRole('timer')).toHaveTextContent('00.00');
    expect(screen.queryByRole('button', { name: 'Start timer' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Stop timer' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Timer control' })).toBeEnabled();

    expect(screen.getByRole('combobox', { name: 'Puzzle type' })).toBeVisible();
    expect(screen.getByRole('combobox', { name: 'Session' })).toHaveTextContent('Sign in');
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
    expect(screen.getByText(/sign in to save this guest solve, then retry/i)).toBeInTheDocument();
    expect((screen.getByRole('textbox', { name: 'Volatile recovery data' }) as HTMLTextAreaElement).value).toContain(testScramble.notation);
    expect(solves.save).not.toHaveBeenCalled();
  });

  it('keeps a guest completion unsaved until an explicit retry claims the signed-in account', async () => {
    const services = makeServices();
    const { solves, scrambleRepository } = renderWithAccountSwitch(services, <TimerPageShell />, null);
    await completeSolve();
    expect(screen.getByText(/sign in to save this guest solve, then retry/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Sign in to save this solve' })).toHaveAttribute('href', '/auth/sign-in');
    expect(scrambleRepository.save).not.toHaveBeenCalled();
    expect(solves.save).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Switch account' }));
    fireEvent.click(screen.getByRole('button', { name: 'Retry save' }));
    await flushPromises();
    expect(scrambleRepository.save).toHaveBeenCalledWith(expect.anything(), ownerId);
    expect(solves.save).toHaveBeenCalledWith(expect.anything(), ownerId);
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
    expect(screen.getByRole('button', { name: 'New Scramble' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Copy Scramble' })).toBeDisabled();
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
    expect(scrambleRepository.save.mock.calls[1]?.[0]).toEqual(scrambleRepository.save.mock.calls[0]?.[0]);
    expect(solves.save.mock.calls[1]?.[0]).toEqual(solves.save.mock.calls[0]?.[0]);
    expect(solves.save.mock.calls.map(([, expectedOwner]) => expectedOwner)).toEqual([ownerId, ownerId]);
    expect(scrambleRepository.save.mock.calls.map(([, expectedOwner]) => expectedOwner)).toEqual([ownerId, ownerId]);
  });

  it('keeps a completed scramble unavailable until the next generation succeeds', async () => {
    const freshScramble: Scramble = {
      ...testScramble,
      id: '55555555-5555-4555-8555-555555555555',
      notation: 'NEXT SCRAMBLE',
    };
    let resolveNext!: (result: ServiceResult<Scramble>) => void;
    const generate = vi.fn()
      .mockResolvedValueOnce({ status: 'success', data: testScramble } satisfies ServiceResult<Scramble>)
      .mockImplementationOnce(() => new Promise<ServiceResult<Scramble>>((resolve) => { resolveNext = resolve; }));
    renderTimer('signed-in', makeServices(undefined, { generate }));
    await completeSolve();
    expect(screen.getByRole('heading', { name: 'Saved' })).toBeInTheDocument();
    expect(screen.getAllByText('Generating scramble…').length).toBeGreaterThan(0);
    expect(screen.queryByText(testScramble.notation)).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Timer control' })).toBeDisabled();
    await act(async () => { resolveNext({ status: 'success', data: freshScramble }); });
    await flushPromises();
    expect(screen.getByText(freshScramble.notation)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Timer control' })).toBeEnabled();
  });

  it('pauses an in-flight save after an account change and retries only for the captured owner', async () => {
    const services = makeServices();
    let resolveFirstScramble!: (result: ServiceResult<void>) => void;
    const scrambleRepo = services.scrambleRepository;
    const saveScramble = vi.fn(async (scramble: Scramble, expectedOwnerId?: string): Promise<ServiceResult<void>> => {
      void scramble;
      void expectedOwnerId;
      return { status: 'success', data: undefined };
    }).mockImplementationOnce((scramble: Scramble, expectedOwnerId?: string) => {
      void scramble;
      void expectedOwnerId;
      return new Promise<ServiceResult<void>>((resolve) => { resolveFirstScramble = resolve; });
    });
    scrambleRepo.save = saveScramble;
    const { solves, scrambleRepository } = renderWithAccountSwitch(services, <TimerPageShell />);
    await completeSolve();
    expect(scrambleRepository.save).toHaveBeenCalledWith(expect.anything(), ownerId);
    fireEvent.click(screen.getByRole('button', { name: 'Switch account' }));
    await act(async () => { resolveFirstScramble({ status: 'success', data: undefined }); });
    await flushPromises();
    expect(screen.getByText(/account that started this solve/i)).toBeInTheDocument();
    expect(solves.save).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: 'Switch account' }));
    fireEvent.click(screen.getByRole('button', { name: 'Retry save' }));
    await flushPromises();
    expect(scrambleRepository.save).toHaveBeenCalledTimes(2);
    expect(scrambleRepository.save.mock.calls[1]?.[0]).toEqual(scrambleRepository.save.mock.calls[0]?.[0]);
    expect(scrambleRepository.save.mock.calls.map(([, expectedOwner]) => expectedOwner)).toEqual([ownerId, ownerId]);
    expect(solves.save).toHaveBeenCalledWith(expect.objectContaining({ scrambleId: scrambleRepository.save.mock.calls[0]?.[0].id }), ownerId);
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
      completionOwnerId: ownerId,
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

  it('prevents timer start and persistence when no real scramble exists', async () => {
    const { solves, scrambleRepository } = renderTimer('signed-in', makeServices(undefined, { scramble: null }));
    await flushPromises();
    expect(screen.getByRole('timer')).toHaveTextContent('00.00');
    const control = screen.getByRole('button', { name: 'Timer control' });
    expect(control).toBeDisabled();
    expect(screen.queryByRole('textbox', { name: 'Exact scramble snapshot' })).not.toBeInTheDocument();
    fireEvent.pointerDown(control, { pointerId: 1, pointerType: 'touch', button: 0 });
    await advance(550);
    fireEvent.pointerUp(control, { pointerId: 1, pointerType: 'touch', button: 0 });
    await flushPromises();

    expect(screen.getByRole('timer')).toHaveTextContent('00.00');
    expect(screen.queryByRole('heading', { name: 'Solve not saved' })).not.toBeInTheDocument();
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
