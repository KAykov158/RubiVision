import { Navigate, Route, Routes } from 'react-router';
import type { ReactNode } from 'react';
import { AppErrorBoundary } from './AppErrorBoundary';
import { AppShell } from './AppShell';
import { AnalyzePage, ChallengesPage, NotFoundPage, ScrambleHistoryPage, SettingsPage, SolvesPage, StatisticsPage, TimerPage } from './RoutePages';
import { AuthPage } from '../features/auth/AuthPage';
import { RequireAuth } from '../features/auth/RequireAuth';

function RouteErrorBoundary({ children }: { children: ReactNode }) {
  return <AppErrorBoundary>{children}</AppErrorBoundary>;
}

export function App() {
  return (
    <Routes>
      <Route path="auth/sign-in" element={<AuthPage mode="sign-in" />} />
      <Route path="auth/sign-up" element={<AuthPage mode="sign-up" />} />
      <Route path="auth/reset-password" element={<AuthPage mode="reset-password" />} />
      <Route element={<AppShell />}>
        <Route index element={<Navigate replace to="/timer" />} />
        <Route path="timer" element={<RouteErrorBoundary><TimerPage /></RouteErrorBoundary>} />
        <Route path="scrambles" element={<RouteErrorBoundary><ScrambleHistoryPage /></RouteErrorBoundary>} />
        <Route element={<RequireAuth />}>
          <Route path="solves" element={<RouteErrorBoundary><SolvesPage /></RouteErrorBoundary>} />
          <Route path="statistics" element={<RouteErrorBoundary><StatisticsPage /></RouteErrorBoundary>} />
          <Route path="analyze" element={<RouteErrorBoundary><AnalyzePage /></RouteErrorBoundary>} />
          <Route path="challenges" element={<RouteErrorBoundary><ChallengesPage /></RouteErrorBoundary>} />
          <Route path="settings" element={<RouteErrorBoundary><SettingsPage /></RouteErrorBoundary>} />
        </Route>
        <Route path="*" element={<RouteErrorBoundary><NotFoundPage /></RouteErrorBoundary>} />
      </Route>
    </Routes>
  );
}
