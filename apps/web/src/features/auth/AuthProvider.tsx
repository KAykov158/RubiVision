import { useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '../../shared/supabase/client';
import { AuthContext, type AuthContextValue, type AuthStatus } from './authContext';

function authErrorMessage(error: { status?: number; message?: string }) {
  if (error.status === 429) return 'Too many attempts. Wait a moment and try again.';
  if (error.status === 400 || error.status === 422) return 'Check the email and password, then try again.';
  if (!navigator.onLine) return 'You are offline. Authentication requires a connection.';
  return 'Authentication could not be completed. Please try again.';
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>(supabase ? 'loading' : 'unconfigured');
  const [user, setUser] = useState<User | null>(null);
  const [passwordRecovery, setPasswordRecovery] = useState(false);

  useEffect(() => {
    if (!supabase) return;
    let active = true;
    const { data: listener } = supabase.auth.onAuthStateChange((event, session: Session | null) => {
      if (!active) return;
      if (event === 'PASSWORD_RECOVERY') setPasswordRecovery(true);
      setUser(session?.user ?? null);
      setStatus(session?.user ? 'signed-in' : 'signed-out');
    });
    void supabase.auth.getSession().then(({ data, error }) => {
      if (!active) return;
      const currentUser = error ? null : data.session?.user ?? null;
      setUser(currentUser);
      setStatus(currentUser ? 'signed-in' : 'signed-out');
    });
    return () => { active = false; listener.subscription.unsubscribe(); };
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    status,
    user,
    passwordRecovery,
    async signUp(email, password) {
      if (!supabase) return 'Cloud authentication is not configured.';
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: { emailRedirectTo: `${window.location.origin}/auth/sign-in` },
      });
      if (error) return authErrorMessage(error);
      if (data.session?.user) {
        setUser(data.session.user);
        setStatus('signed-in');
        return null;
      }
      return 'Check your email to confirm your account, then sign in.';
    },
    async signIn(email, password) {
      if (!supabase) return 'Cloud authentication is not configured.';
      const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (error) return authErrorMessage(error);
      setUser(data.user);
      setStatus('signed-in');
      return null;
    },
    async signOut() {
      if (!supabase) return null;
      const { error } = await supabase.auth.signOut();
      if (error) return authErrorMessage(error);
      setUser(null);
      setStatus('signed-out');
      return null;
    },
    async sendPasswordReset(email) {
      if (!supabase) return 'Cloud authentication is not configured.';
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });
      return error ? authErrorMessage(error) : null;
    },
    async updatePassword(password) {
      if (!supabase) return 'Cloud authentication is not configured.';
      const { error } = await supabase.auth.updateUser({ password });
      if (error) return authErrorMessage(error);
      setPasswordRecovery(false);
      return null;
    },
  }), [passwordRecovery, status, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
