import { Navigate, Outlet, useLocation } from 'react-router';
import { Spinner } from '../../shared/components/primitives';
import { isSupabaseConfigured } from '../../shared/supabase/client';
import { useAuth } from './authContext';

export function RequireAuth() {
  const auth = useAuth();
  const location = useLocation();
  if (!isSupabaseConfigured) return <Outlet />;
  if (auth.status === 'loading') return <main aria-busy="true" aria-label="Restoring authentication session"><Spinner label="Restoring authentication session" /></main>;
  if (auth.status !== 'signed-in') return <Navigate replace state={{ from: location }} to="/auth/sign-in" />;
  return <Outlet />;
}
