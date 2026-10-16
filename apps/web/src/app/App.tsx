import { Navigate, Route, Routes } from 'react-router';
import type { ReactNode } from 'react';
import { AppErrorBoundary } from './AppErrorBoundary';
import { AppShell } from './AppShell';
import { AnalyzePage, ChallengesPage, NotFoundPage, SettingsPage, SolvesPage, StatisticsPage, TimerPage } from './RoutePages';

function RouteErrorBoundary({ children }: { children: ReactNode }) {
  return <AppErrorBoundary>{children}</AppErrorBoundary>;
}

export function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<Navigate replace to="/timer" />} />
        <Route path="timer" element={<RouteErrorBoundary><TimerPage /></RouteErrorBoundary>} />
        <Route path="solves" element={<RouteErrorBoundary><SolvesPage /></RouteErrorBoundary>} />
        <Route path="statistics" element={<RouteErrorBoundary><StatisticsPage /></RouteErrorBoundary>} />
        <Route path="analyze" element={<RouteErrorBoundary><AnalyzePage /></RouteErrorBoundary>} />
        <Route path="challenges" element={<RouteErrorBoundary><ChallengesPage /></RouteErrorBoundary>} />
        <Route path="settings" element={<RouteErrorBoundary><SettingsPage /></RouteErrorBoundary>} />
        <Route path="*" element={<RouteErrorBoundary><NotFoundPage /></RouteErrorBoundary>} />
      </Route>
    </Routes>
  );
}
