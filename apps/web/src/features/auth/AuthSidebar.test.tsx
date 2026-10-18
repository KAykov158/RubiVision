import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { AuthChangeEvent, Session, User } from '@supabase/supabase-js';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router';
import { App } from '../../app/App';
import { AuthProvider } from './AuthProvider';
import { LocaleProvider } from '../../shared/i18n/LocaleProvider';

const mockSupabase = vi.hoisted(() => ({
  auth: {
    onAuthStateChange: vi.fn(),
    getSession: vi.fn(),
    signInWithPassword: vi.fn(),
    signOut: vi.fn(),
  },
}));

vi.mock('../../shared/supabase/client', () => ({
  supabase: mockSupabase,
  isSupabaseConfigured: true,
}));

const testUser = {
  id: 'd1e79f7e-816c-468f-9a66-312f50712b37',
  app_metadata: { provider: 'email', providers: ['email'] },
  user_metadata: { display_name: 'Rubi Solver' },
  aud: 'authenticated',
  created_at: '2026-01-01T00:00:00.000Z',
  email: 'solver@example.test',
} as User;

let authListener: ((event: AuthChangeEvent, session: Session | null) => void) | null;

function renderApp(path: string) {
  return render(
    <LocaleProvider>
      <AuthProvider>
        <MemoryRouter initialEntries={[path]}><App /></MemoryRouter>
      </AuthProvider>
    </LocaleProvider>,
  );
}

describe('authenticated sidebar identity', () => {
  beforeEach(() => {
    authListener = null;
    mockSupabase.auth.onAuthStateChange.mockImplementation((listener: (event: AuthChangeEvent, session: Session | null) => void) => {
      authListener = listener;
      return { data: { subscription: { unsubscribe: vi.fn() } } };
    });
    mockSupabase.auth.getSession.mockResolvedValue({ data: { session: null }, error: null });
    mockSupabase.auth.signInWithPassword.mockResolvedValue({ data: { user: testUser }, error: null });
    mockSupabase.auth.signOut.mockImplementation(async () => {
      authListener?.('SIGNED_OUT', null);
      return { error: null };
    });
  });

  it('shows Guest after session restoration confirms the user is signed out', async () => {
    renderApp('/timer');

    expect(await screen.findByText('Guest')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Sign out' })).not.toBeInTheDocument();
  });

  it('shows a restored user display name in the sidebar', async () => {
    mockSupabase.auth.getSession.mockResolvedValue({ data: { session: { user: testUser } }, error: null });
    renderApp('/timer');

    expect(await screen.findByText('Rubi Solver')).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: 'Sign out' })).toHaveLength(2);
  });

  it('falls back to the restored user email when display metadata is absent', async () => {
    mockSupabase.auth.getSession.mockResolvedValue({ data: { session: { user: { ...testUser, user_metadata: {} } } }, error: null });
    renderApp('/timer');
    expect(await screen.findByText('solver@example.test')).toBeInTheDocument();
  });

  it('updates the sidebar after sign-in and returns to Guest after sign-out', async () => {
    const user = userEvent.setup();
    renderApp('/auth/sign-in');
    await screen.findByRole('heading', { name: 'Sign in to RubiVision' });
    await user.type(screen.getByLabelText('Email'), 'solver@example.test');
    await user.type(screen.getByLabelText('Password'), 'correct-horse');
    await user.click(screen.getByRole('button', { name: 'Sign in' }));

    expect(await screen.findByText('Rubi Solver')).toBeInTheDocument();
    const signOutButtons = screen.getAllByRole('button', { name: 'Sign out' });
    expect(signOutButtons).toHaveLength(2);
    await user.click(signOutButtons[0] as HTMLElement);
    expect(await screen.findByText('Guest')).toBeInTheDocument();
  });

  it('redirects signed-out users away from protected routes', async () => {
    renderApp('/statistics');

    expect(await screen.findByRole('heading', { name: 'Sign in to RubiVision' })).toBeInTheDocument();
  });

  it('allows a restored signed-in user to open a protected route', async () => {
    mockSupabase.auth.getSession.mockResolvedValue({ data: { session: { user: testUser } }, error: null });
    renderApp('/statistics');

    expect(await screen.findByRole('heading', { name: 'Statistics' })).toBeInTheDocument();
    expect(screen.getByText('Rubi Solver')).toBeInTheDocument();
  });
});
