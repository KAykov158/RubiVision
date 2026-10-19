import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router';
import { Button, Dialog, IconButton } from '../shared/components/primitives';
import { ProfileSummary } from '../shared/components/ProfileSummary';
import { useTranslation } from '../shared/i18n/useTranslation';
import { useAuth } from '../features/auth/authContext';
import { isSupabaseConfigured } from '../shared/supabase/client';

function getUserDisplayName(user: ReturnType<typeof useAuth>['user']) {
  const metadata = user?.user_metadata;
  for (const value of [metadata?.display_name, metadata?.full_name, metadata?.name]) {
    if (typeof value === 'string' && value.trim()) return value.trim();
  }
  return user?.email?.trim() || null;
}

const navigationItems = [
  { to: '/timer', label: 'navigationTimer', icon: 'timer' },
  { to: '/solves', label: 'navigationSolves', icon: 'solves' },
  { to: '/statistics', label: 'navigationStatistics', icon: 'statistics' },
  { to: '/analyze', label: 'navigationAnalyze', icon: 'analyze' },
  { to: '/challenges', label: 'navigationChallenges', icon: 'challenges' },
  { to: '/settings', label: 'navigationSettings', icon: 'settings' },
] as const;

function NavigationIcon({ name }: { name: (typeof navigationItems)[number]['icon'] }) {
  const paths = {
    timer: <><circle cx="12" cy="13" r="8" /><path d="M12 9v4l2.5 1.5M9 2h6M12 2v3M19 6l1.5-1.5" /></>,
    solves: <><path d="M5 4.5h14v15H5z" /><path d="M8 8h8M8 12h8M8 16h5" /></>,
    scrambles: <><path d="m4 8 4-4 4 4M8 4v10a5 5 0 0 0 5 5h7" /><path d="m16 15 4 4-4 4" /></>,
    statistics: <><path d="M4 19V5M4 19h17" /><path d="m7 15 4-4 3 2 5-7" /></>,
    analyze: <><circle cx="10.5" cy="10.5" r="6.5" /><path d="m15.5 15.5 5 5M8 11l2-2 2 2 3-3" /></>,
    challenges: <><path d="M8 4h8v3a4 4 0 0 1-8 0zM12 11v5M8 20h8M10 16h4" /><path d="M8 6H5v2a3 3 0 0 0 3 3M16 6h3v2a3 3 0 0 1-3 3" /></>,
    settings: <><circle cx="12" cy="12" r="7.1" /><circle cx="12" cy="12" r="3.1" /><path d="M12 2v2.8m0 14.4V22M2 12h2.8m14.4 0H22M4.93 4.93l1.98 1.98m10.18 10.18 1.98 1.98m0-14.14-1.98 1.98M6.91 17.09l-1.98 1.98" /></>,
  };

  return <svg aria-hidden="true" className="app-navigation__icon" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" viewBox="0 0 24 24">{paths[name]}</svg>;
}

function PrimaryNavigation({ onNavigate }: { onNavigate?: () => void }) {
  const t = useTranslation();

  return (
    <nav aria-label={t('primaryNavigation')}>
      <ul className="app-navigation">
        {navigationItems.map(({ to, label, icon }) => (
          <li key={to}>
            <NavLink
              className={({ isActive }) => `app-navigation__link${isActive ? ' is-active' : ''}`}
              onClick={onNavigate}
              to={to}
            >
              <NavigationIcon name={icon} />
              {t(label)}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export function AppShell() {
  const t = useTranslation();
  const auth = useAuth();
  const userDisplayName = getUserDisplayName(auth.user);
  const profileDisplayName = userDisplayName
    ?? (auth.status === 'loading'
      ? t('loading')
      : auth.user
        ? t('sidebarAccountLabel')
        : t('sidebarGuestLabel'));
  const navigate = useNavigate();
  const location = useLocation();
  const previousPath = useRef(location.pathname);
  const [connectionStatus, setConnectionStatus] = useState<'online' | 'offline' | null>(() =>
    typeof navigator !== 'undefined' && !navigator.onLine ? 'offline' : null,
  );
  const [mobileNavigationPath, setMobileNavigationPath] = useState<string | null>(null);
  const [authMessage, setAuthMessage] = useState<string | null>(null);
  const mobileNavigationOpen = mobileNavigationPath === location.pathname;

  async function handleSignOut() {
    try {
      const error = await auth.signOut();
      if (error) setAuthMessage(error);
      else navigate('/timer');
    } catch {
      setAuthMessage('Sign out could not be completed. Check your connection and try again.');
    }
  }

  useEffect(() => {
    const handleOffline = () => setConnectionStatus('offline');
    const handleOnline = () => setConnectionStatus('online');
    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);
    return () => {
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
    };
  }, []);

  useEffect(() => {
    if (previousPath.current === location.pathname) return;
    previousPath.current = location.pathname;
    document.getElementById('main-content')?.focus();
  }, [location.pathname]);

  return (
    <>
      <a className="app-skip-link" href="#main-content" tabIndex={0}>{t('skipToContent')}</a>
      <p aria-live="polite" className={connectionStatus === 'offline' ? 'app-connectivity app-connectivity--offline' : 'rv-visually-hidden'} role={connectionStatus ? 'status' : undefined}>
        {connectionStatus === 'offline' ? t('offlineNotice') : connectionStatus === 'online' ? t('connectionRestored') : ''}
      </p>
      <div className="app-shell">
        <header className="app-header">
          <IconButton
            aria-controls="mobile-primary-navigation"
            aria-expanded={mobileNavigationOpen}
            aria-label={t('openNavigation')}
            className="app-header__menu"
            onClick={() => setMobileNavigationPath(location.pathname)}
          >
            <span aria-hidden="true">☰</span>
          </IconButton>
          <Link className="app-header__brand" to="/timer">{t('appTitle')}</Link>
          {isSupabaseConfigured && auth.status === 'signed-in' && <Button onClick={() => void handleSignOut()}>Sign out</Button>}
        </header>

        <aside className="app-sidebar">
          <Link className="app-sidebar__brand" to="/timer">
            <span aria-hidden="true" className="app-sidebar__brand-mark">R</span>
            <span>{t('appTitle')}</span>
          </Link>
          <ProfileSummary displayName={profileDisplayName} profileLabel={t('sidebarProfileLabel')} />
          {isSupabaseConfigured && auth.status === 'signed-in' && <Button onClick={() => void handleSignOut()}>Sign out</Button>}
          <PrimaryNavigation />
        </aside>

        <div className="app-route-content">
          <Outlet />
        </div>
      </div>
      {authMessage && <p aria-live="polite" className="rv-visually-hidden" role="status">{authMessage}</p>}

      <Dialog
        id="mobile-primary-navigation"
        className="rv-dialog--drawer"
        open={mobileNavigationOpen}
        onClose={() => setMobileNavigationPath(null)}
        title={t('mobileNavigationTitle')}
      >
        <PrimaryNavigation onNavigate={() => setMobileNavigationPath(null)} />
      </Dialog>
    </>
  );
}
