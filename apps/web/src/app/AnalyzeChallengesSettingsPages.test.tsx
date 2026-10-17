import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import type { AppServices } from '../shared/domain/contracts';
import { App } from './App';
import { AppProviders } from './AppProviders';
import { AnalysisStatePanel, CameraAccessNotice } from './AnalyzePage';

function servicesWithPreferences(preferences: NonNullable<AppServices['preferences']>): AppServices {
  return {
    scrambles: { generate: vi.fn() },
    solves: { save: vi.fn(), get: vi.fn(), list: vi.fn(), updatePenalty: vi.fn() },
    analysis: { analyze: vi.fn() },
    preferences,
  } as AppServices;
}

function renderRoute(path: string, services?: AppServices) {
  window.history.replaceState(null, '', path);
  return render(<AppProviders services={services}><App /></AppProviders>);
}

describe('Analyze page shell', () => {
  it('shows disabled camera and upload entry points, an empty video area, and no fabricated analysis', () => {
    renderRoute('/analyze');
    expect(screen.getByRole('heading', { name: 'Analyze', level: 1 })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Start camera recording' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Choose a video' })).toBeDisabled();
    expect(screen.getByRole('img', { name: /No recording selected/ })).toBeInTheDocument();
    expect(screen.queryByRole('video')).not.toBeInTheDocument();
    expect(screen.getByText(/has not requested camera permission/)).toBeInTheDocument();
    expect(screen.getByText(/do not identify exact cube moves/)).toBeInTheDocument();
    expect(screen.getAllByText('No classification is available because no recording has been analyzed.')).toHaveLength(3);
    expect(screen.getByRole('heading', { name: 'Analysis unavailable' })).toBeInTheDocument();
  });

  it('supports localized loading, empty and retryable analysis error states at the integration boundary', async () => {
    const user = userEvent.setup();
    const retry = vi.fn();
    const { rerender } = render(<AppProviders><AnalysisStatePanel state="loading" /></AppProviders>);
    expect(screen.getByRole('region', { name: 'Analysis in progress' })).toHaveAttribute('aria-busy', 'true');
    rerender(<AppProviders><AnalysisStatePanel state="empty" /></AppProviders>);
    expect(screen.getByRole('heading', { name: 'No analysis to show' })).toBeInTheDocument();
    rerender(<AppProviders><AnalysisStatePanel state="error" onRetry={retry} /></AppProviders>);
    expect(screen.getByRole('alert')).toHaveTextContent('The analysis service reported an error');
    await user.click(screen.getByRole('button', { name: 'Try again' }));
    expect(retry).toHaveBeenCalledOnce();
  });

  it('renders camera denied and unsupported messages as view states without requesting permission', () => {
    const { rerender } = render(<AppProviders><CameraAccessNotice state="denied" /></AppProviders>);
    expect(screen.getByRole('alert')).toHaveTextContent(/Camera permission was denied/);
    rerender(<AppProviders><CameraAccessNotice state="unsupported" /></AppProviders>);
    expect(screen.getByRole('status')).toHaveTextContent(/unsupported in this browser or device/);
  });
});

describe('Challenges page shell', () => {
  it('keeps discovery empty and participation unavailable without challenge data', () => {
    renderRoute('/challenges');
    expect(screen.getByRole('heading', { name: 'Challenges', level: 1 })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'No challenge entries are available' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Challenge participation unavailable' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Join a challenge' })).toBeDisabled();
    expect(screen.queryByText(/leaderboard|rank|participants/i)).not.toBeInTheDocument();
  });
});

describe('Settings page shell', () => {
  it('retains the live theme control and labels unsupported preferences as unavailable', async () => {
    const user = userEvent.setup();
    renderRoute('/settings');
    expect(screen.getByRole('heading', { name: 'Settings', level: 1 })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Appearance' })).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: 'Color theme' })).toBeEnabled();
    expect(screen.getByRole('combobox', { name: 'Display language' })).toBeDisabled();
    expect(screen.getByRole('heading', { name: 'Account settings unavailable' })).toBeInTheDocument();
    expect(screen.getByText(/Camera permission is requested only by an explicit recording feature/)).toBeInTheDocument();
    expect(screen.getByText(/follows your operating system or browser reduced-motion preference/)).toBeInTheDocument();

    await user.selectOptions(screen.getByRole('combobox', { name: 'Color theme' }), 'dark');
    await waitFor(() => expect(document.documentElement).toHaveAttribute('data-theme', 'dark'));
    expect(await screen.findByText(/applies for this session/)).toBeInTheDocument();
    expect(screen.getByText(/Language selection and account persistence are not implemented/)).toBeInTheDocument();
  });

  it('uses the injected preferences service and reports its save result', async () => {
    const user = userEvent.setup();
    const preferences: NonNullable<AppServices['preferences']> = {
      getThemePreference: vi.fn().mockResolvedValue({ status: 'success', data: null }),
      saveThemePreference: vi.fn().mockResolvedValue({ status: 'success', data: undefined }),
    };
    renderRoute('/settings', servicesWithPreferences(preferences));
    await user.selectOptions(screen.getByRole('combobox', { name: 'Color theme' }), 'light');
    await waitFor(() => expect(preferences.saveThemePreference).toHaveBeenCalledWith('light'));
    expect(await screen.findByText('Theme preference saved to your account.')).toBeInTheDocument();
  });
});
