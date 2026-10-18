import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { describe, expect, it, vi } from 'vitest';
import { AuthPage } from './AuthPage';
import { AuthContext, type AuthContextValue } from './authContext';

function renderAuthPage(mode: 'sign-in' | 'sign-up' | 'reset-password', overrides: Partial<AuthContextValue> = {}) {
  const value: AuthContextValue = {
    status: 'signed-out',
    user: null,
    passwordRecovery: false,
    signUp: vi.fn().mockResolvedValue(null),
    signIn: vi.fn().mockResolvedValue(null),
    signOut: vi.fn().mockResolvedValue(null),
    sendPasswordReset: vi.fn().mockResolvedValue(null),
    updatePassword: vi.fn().mockResolvedValue(null),
    ...overrides,
  };
  render(
    <AuthContext.Provider value={value}>
      <MemoryRouter initialEntries={[`/auth/${mode}`]}><AuthPage mode={mode} /></MemoryRouter>
    </AuthContext.Provider>,
  );
  return value;
}

describe('authentication forms', () => {
  it('submits sign-in credentials and displays a safe authentication error', async () => {
    const user = userEvent.setup();
    const auth = renderAuthPage('sign-in', { signIn: vi.fn().mockResolvedValue('Check your credentials and try again.') });
    await user.type(screen.getByLabelText('Email'), 'solver@example.test');
    await user.type(screen.getByLabelText('Password'), 'correct-horse');
    await user.click(screen.getByRole('button', { name: 'Sign in' }));
    expect(await screen.findByRole('status')).toHaveTextContent('Check your credentials and try again.');
    expect(auth.signIn).toHaveBeenCalledWith('solver@example.test', 'correct-horse');
  });

  it('submits account registration', async () => {
    const user = userEvent.setup();
    const auth = renderAuthPage('sign-up', { signUp: vi.fn().mockResolvedValue('Check your email to confirm your account, then sign in.') });
    await user.type(screen.getByLabelText('Email'), 'new-solver@example.test');
    await user.type(screen.getByLabelText('Password'), 'correct-horse');
    await user.click(screen.getByRole('button', { name: 'Create account' }));
    expect(await screen.findByRole('status')).toHaveTextContent('Check your email to confirm your account');
    expect(auth.signUp).toHaveBeenCalledWith('new-solver@example.test', 'correct-horse');
  });

  it('confirms reset requests with a message that does not disclose account existence', async () => {
    const user = userEvent.setup();
    const auth = renderAuthPage('reset-password');
    await user.type(screen.getByLabelText('Email'), 'solver@example.test');
    await user.click(screen.getByRole('button', { name: 'Send reset link' }));
    expect(await screen.findByRole('status')).toHaveTextContent('If that account exists, a password reset link has been sent.');
    expect(auth.sendPasswordReset).toHaveBeenCalledWith('solver@example.test');
  });
});
