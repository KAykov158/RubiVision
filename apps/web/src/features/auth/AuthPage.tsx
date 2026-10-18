import { useState, type FormEvent } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router';
import { Button, Card, Field, PageContainer } from '../../shared/components/primitives';
import { useAuth } from './authContext';

type AuthMode = 'sign-in' | 'sign-up' | 'reset-password';

export function AuthPage({ mode }: { mode: AuthMode }) {
  const auth = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const requestedRoute = (location.state as { from?: { pathname?: string; search?: string; hash?: string } } | null)?.from;
  const returnTo = requestedRoute?.pathname?.startsWith('/') && !requestedRoute.pathname.startsWith('//')
    ? `${requestedRoute.pathname}${requestedRoute.search ?? ''}${requestedRoute.hash ?? ''}`
    : '/timer';

  if (auth.status === 'signed-in' && !auth.passwordRecovery) return <Navigate replace to={returnTo} />;

  const isReset = mode === 'reset-password';
  const isRecovery = isReset && auth.passwordRecovery;
  const title = isRecovery ? 'Choose a new password' : isReset ? 'Reset password' : mode === 'sign-up' ? 'Create your account' : 'Sign in to RubiVision';

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage(null);
    try {
      let result: string | null;
      if (isRecovery) result = await auth.updatePassword(password);
      else if (isReset) result = await auth.sendPasswordReset(email);
      else if (mode === 'sign-up') result = await auth.signUp(email, password);
      else result = await auth.signIn(email, password);
      if (result) setMessage(result);
      else if (isReset && !isRecovery) setMessage('If that account exists, a password reset link has been sent.');
      else navigate(returnTo, { replace: true });
    } catch {
      setMessage('Authentication could not be completed. Check your connection and try again.');
    } finally {
      setBusy(false);
    }
  }

  return <PageContainer className="app-main auth-page" id="main-content" tabIndex={-1}>
    <Card className="auth-card">
      <h1>{title}</h1>
      {auth.status === 'unconfigured' && <p role="status">Cloud authentication is not configured. Add the public Supabase URL and publishable key to continue.</p>}
      <form onSubmit={(event) => void submit(event)}>
        {!isRecovery && <Field autoComplete="email" id="auth-email" label="Email" onChange={(event) => setEmail(event.target.value)} required type="email" value={email} />}
        {(!isReset || isRecovery) && <Field autoComplete={mode === 'sign-up' || isRecovery ? 'new-password' : 'current-password'} id="auth-password" label="Password" minLength={8} onChange={(event) => setPassword(event.target.value)} required type="password" value={password} />}
        {message && <p aria-live="polite" role="status">{message}</p>}
        <Button disabled={busy || auth.status === 'unconfigured'} type="submit">{busy ? 'Please wait…' : isRecovery ? 'Update password' : isReset ? 'Send reset link' : mode === 'sign-up' ? 'Create account' : 'Sign in'}</Button>
      </form>
      <nav aria-label="Account actions" className="auth-card__links">
        {mode !== 'sign-in' && <Link to="/auth/sign-in">Sign in</Link>}
        {mode !== 'sign-up' && <Link to="/auth/sign-up">Create account</Link>}
        {!isReset && <Link to="/auth/reset-password">Forgot password?</Link>}
      </nav>
    </Card>
  </PageContainer>;
}
