import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { AppServices, ServiceResult, ThemePreference, UserPreferencesService } from '../domain/contracts';
import { AppProviders } from '../../app/AppProviders';
import { useThemePreference } from './useThemePreference';
import { ThemeSettings } from './ThemeSettings';
import { isThemePreference } from './themePreference';

const notConfigured = { status: 'unavailable', reason: 'NOT_CONFIGURED' } as const satisfies ServiceResult<never>;

afterEach(() => {
  vi.unstubAllGlobals();
});

function createServices(preferences: UserPreferencesService): AppServices {
  return {
    scrambles: { generate: async () => notConfigured },
    solves: {
      save: async () => notConfigured,
      get: async () => notConfigured,
      list: async () => notConfigured,
      updatePenalty: async () => notConfigured,
    },
    analysis: { analyze: async () => notConfigured },
    preferences,
  };
}

function ThemeStatus() {
  const { preference, resolvedTheme } = useThemePreference();
  return <output aria-label="Theme state">{preference}:{resolvedTheme}</output>;
}

describe('theme preference infrastructure', () => {
  it('accepts only supported persisted preference values', () => {
    expect(isThemePreference('system')).toBe(true);
    expect(isThemePreference('light')).toBe(true);
    expect(isThemePreference('dark')).toBe(true);
    expect(isThemePreference('sepia')).toBe(false);
    expect(isThemePreference(null)).toBe(false);
  });

  it('loads a saved preference through the injected service and reports successful saves', async () => {
    let saved: ThemePreference = 'dark';
    const preferences: UserPreferencesService = {
      getThemePreference: vi.fn(async (): Promise<ServiceResult<unknown>> => ({ status: 'success', data: saved })),
      saveThemePreference: vi.fn(async (theme: ThemePreference): Promise<ServiceResult<void>> => {
        saved = theme;
        return { status: 'success', data: undefined };
      }),
    };
    const view = render(<AppProviders services={createServices(preferences)}><><ThemeStatus /><ThemeSettings /></></AppProviders>);

    const select = await screen.findByRole('combobox', { name: 'Color theme' });
    await waitFor(() => expect(select).toHaveValue('dark'));
    expect(document.documentElement.dataset.theme).toBe('dark');

    fireEvent.change(select, { target: { value: 'light' } });
    await waitFor(() => expect(screen.getByText('Theme preference saved to your account.')).toBeInTheDocument());
    expect(preferences.saveThemePreference).toHaveBeenCalledWith('light');
    expect(screen.getByLabelText('Theme state')).toHaveTextContent('light:light');

    view.unmount();
    render(<AppProviders services={createServices(preferences)}><><ThemeStatus /><ThemeSettings /></></AppProviders>);
    await waitFor(() => expect(screen.getByLabelText('Theme state')).toHaveTextContent('light:light'));
  });

  it('keeps a newer user choice when an older preference read resolves later', async () => {
    let resolveRead!: (result: ServiceResult<unknown>) => void;
    const pendingRead = new Promise<ServiceResult<unknown>>((resolve) => { resolveRead = resolve; });
    const preferences: UserPreferencesService = {
      getThemePreference: vi.fn(() => pendingRead),
      saveThemePreference: vi.fn(async (): Promise<ServiceResult<void>> => ({ status: 'success', data: undefined })),
    };
    render(<AppProviders services={createServices(preferences)}><><ThemeStatus /><ThemeSettings /></></AppProviders>);

    const select = await screen.findByRole('combobox', { name: 'Color theme' });
    await waitFor(() => expect(preferences.getThemePreference).toHaveBeenCalledOnce());
    fireEvent.change(select, { target: { value: 'dark' } });
    expect(screen.getByLabelText('Theme state')).toHaveTextContent('dark:dark');
    expect(await screen.findByText('Theme preference saved to your account.')).toBeInTheDocument();

    await act(async () => {
      resolveRead({ status: 'success', data: 'light' });
      await pendingRead;
    });

    expect(screen.getByLabelText('Theme state')).toHaveTextContent('dark:dark');
    expect(document.documentElement.dataset.theme).toBe('dark');
  });

  it('ignores a corrupted persisted value and falls back to system without crashing', async () => {
    const preferences: UserPreferencesService = {
      getThemePreference: async () => ({ status: 'success', data: 'sepia' }),
      saveThemePreference: async () => ({ status: 'success', data: undefined }),
    };
    render(<AppProviders services={createServices(preferences)}><><ThemeStatus /><ThemeSettings /></></AppProviders>);

    expect(await screen.findByText('The saved theme setting was invalid. Using the system theme for this session.')).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: 'Color theme' })).toHaveValue('system');
    expect(screen.getByLabelText('Theme state')).toHaveTextContent('system:light');
  });

  it('tracks operating-system theme changes only while system mode is selected', async () => {
    let listener: ((event: MediaQueryListEvent) => void) | undefined;
    let systemMatches = false;
    const removeListener = vi.fn();
    const addListener = vi.fn((_type: string, callback: (event: MediaQueryListEvent) => void) => { listener = callback; });
    const mediaQuery = {
      get matches() { return systemMatches; },
      media: '(prefers-color-scheme: dark)',
      onchange: null,
      addEventListener: addListener,
      removeEventListener: removeListener,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(() => true),
    } as unknown as MediaQueryList;
    vi.stubGlobal('matchMedia', vi.fn(() => mediaQuery));

    const preferences: UserPreferencesService = {
      getThemePreference: async () => ({ status: 'success', data: 'system' }),
      saveThemePreference: async () => ({ status: 'success', data: undefined }),
    };
    render(<AppProviders services={createServices(preferences)}><><ThemeStatus /><ThemeSettings /></></AppProviders>);
    const select = await screen.findByRole('combobox', { name: 'Color theme' });
    await waitFor(() => expect(addListener).toHaveBeenCalled());
    act(() => listener?.({ matches: true } as MediaQueryListEvent));
    expect(screen.getByLabelText('Theme state')).toHaveTextContent('system:dark');

    fireEvent.change(select, { target: { value: 'light' } });
    await waitFor(() => expect(removeListener).toHaveBeenCalled());
    expect(addListener).toHaveBeenCalledTimes(1);
    systemMatches = true;
    fireEvent.change(select, { target: { value: 'system' } });
    expect(screen.getByLabelText('Theme state')).toHaveTextContent('system:dark');
    expect(addListener).toHaveBeenCalledTimes(2);
    act(() => listener?.({ matches: false } as MediaQueryListEvent));
    expect(screen.getByLabelText('Theme state')).toHaveTextContent('system:light');
  });

  it('handles unavailable preference service results without breaking theme selection', async () => {
    const preferences: UserPreferencesService = {
      getThemePreference: async () => ({ status: 'unavailable', reason: 'NETWORK_REQUIRED' }),
      saveThemePreference: async () => ({ status: 'error', code: 'NETWORK' }),
    };
    render(<AppProviders services={createServices(preferences)}><><ThemeStatus /><ThemeSettings /></></AppProviders>);
    const select = await screen.findByRole('combobox', { name: 'Color theme' });
    expect(await screen.findByText('Could not load the saved theme. Using the system theme for this session.')).toBeInTheDocument();

    fireEvent.change(select, { target: { value: 'dark' } });
    expect(screen.getByLabelText('Theme state')).toHaveTextContent('dark:dark');
    expect(await screen.findByText('Theme changed for this session, but could not be saved to your account.')).toBeInTheDocument();
  });

  it('continues with the system default after unmounting and mounting without a preference service', async () => {
    const { unmount } = render(<AppProviders><><ThemeStatus /><ThemeSettings /></></AppProviders>);
    expect(await screen.findByRole('combobox', { name: 'Color theme' })).toHaveValue('system');
    unmount();
    render(<AppProviders><><ThemeStatus /><ThemeSettings /></></AppProviders>);
    expect(await screen.findByLabelText('Theme state')).toHaveTextContent('system:light');
    expect(await screen.findByText('Theme applies for this session. Account preference sync is not configured.')).toBeInTheDocument();
  });
});
