import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router';
import { Dialog, IconButton } from '../shared/components/primitives';
import { useTranslation } from '../shared/i18n/useTranslation';

const navigationItems = [
  { to: '/timer', label: 'navigationTimer' },
  { to: '/solves', label: 'navigationSolves' },
  { to: '/statistics', label: 'navigationStatistics' },
  { to: '/analyze', label: 'navigationAnalyze' },
  { to: '/challenges', label: 'navigationChallenges' },
  { to: '/settings', label: 'navigationSettings' },
] as const;

function PrimaryNavigation({ onNavigate }: { onNavigate?: () => void }) {
  const t = useTranslation();

  return (
    <nav aria-label={t('primaryNavigation')}>
      <ul className="app-navigation">
        {navigationItems.map(({ to, label }) => (
          <li key={to}>
            <NavLink
              className={({ isActive }) => `app-navigation__link${isActive ? ' is-active' : ''}`}
              onClick={onNavigate}
              to={to}
            >
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
  const location = useLocation();
  const previousPath = useRef(location.pathname);
  const [connectionStatus, setConnectionStatus] = useState<'online' | 'offline' | null>(() =>
    typeof navigator !== 'undefined' && !navigator.onLine ? 'offline' : null,
  );
  const [mobileNavigationPath, setMobileNavigationPath] = useState<string | null>(null);
  const mobileNavigationOpen = mobileNavigationPath === location.pathname;

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
        </header>

        <aside className="app-sidebar">
          <PrimaryNavigation />
        </aside>

        <div className="app-route-content">
          <Outlet />
        </div>
      </div>

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
