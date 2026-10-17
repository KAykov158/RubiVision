import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router';
import { Dialog, IconButton } from '../shared/components/primitives';
import { ProfileSummary } from '../shared/components/ProfileSummary';
import { useTranslation } from '../shared/i18n/useTranslation';

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
    statistics: <><path d="M4 19V5M4 19h17" /><path d="m7 15 4-4 3 2 5-7" /></>,
    analyze: <><circle cx="10.5" cy="10.5" r="6.5" /><path d="m15.5 15.5 5 5M8 11l2-2 2 2 3-3" /></>,
    challenges: <><path d="M8 4h8v3a4 4 0 0 1-8 0zM12 11v5M8 20h8M10 16h4" /><path d="M8 6H5v2a3 3 0 0 0 3 3M16 6h3v2a3 3 0 0 1-3 3" /></>,
    settings: <><circle cx="12" cy="12" r="3" /><path d="m19.4 15 .1.1a1.7 1.7 0 0 1-2.4 2.4l-.1-.1a1.7 1.7 0 0 0-2.9 1.2v.2a1.7 1.7 0 0 1-3.4 0v-.2a1.7 1.7 0 0 0-2.9-1.2l-.1.1a1.7 1.7 0 1 1-2.4-2.4l.1-.1a1.7 1.7 0 0 0-1.2-2.9H4a1.7 1.7 0 0 1 0-3.4h.2a1.7 1.7 0 0 0 1.2-2.9l-.1-.1a1.7 1.7 0 1 1 2.4-2.4l.1.1a1.7 1.7 0 0 0 2.9-1.2V2a1.7 1.7 0 0 1 3.4 0v.2a1.7 1.7 0 0 0 2.9 1.2l.1-.1a1.7 1.7 0 1 1 2.4 2.4l-.1.1a1.7 1.7 0 0 0 1.2 2.9h.2a1.7 1.7 0 0 1 0 3.4h-.2a1.7 1.7 0 0 0-1.2 2.9Z" /></>,
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
          <Link className="app-sidebar__brand" to="/timer">
            <span aria-hidden="true" className="app-sidebar__brand-mark">R</span>
            <span>{t('appTitle')}</span>
          </Link>
          <ProfileSummary displayName={t('sidebarGuestLabel')} profileLabel={t('sidebarProfileLabel')} />
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
