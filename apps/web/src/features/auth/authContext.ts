import { createContext, useContext } from 'react';
import type { User } from '@supabase/supabase-js';

export type AuthStatus = 'loading' | 'signed-in' | 'signed-out' | 'unconfigured';
export type AuthContextValue = {
  status: AuthStatus;
  user: User | null;
  passwordRecovery: boolean;
  signUp(email: string, password: string): Promise<string | null>;
  signIn(email: string, password: string): Promise<string | null>;
  signOut(): Promise<string | null>;
  sendPasswordReset(email: string): Promise<string | null>;
  updatePassword(password: string): Promise<string | null>;
};

export const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth must be used within AuthProvider.');
  return value;
}
