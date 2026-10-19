import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import type { AppServices, Scramble } from '../shared/domain/contracts';
import { App } from './App';
import { AppProviders } from './AppProviders';

const scramble: Scramble = {
  id: '9a000000-0000-4000-8000-000000000002',
  puzzle: '333',
  notation: "R U R' U' F2",
  generatorProvider: 'test-provider',
  generatorVersion: 'test-v1',
  generationMethod: 'RANDOM_STATE',
  createdAt: '2026-10-19T12:00:00.000Z',
};

const testServices: AppServices = {
  scrambles: { generate: async (puzzle) => ({ status: 'success', data: { ...scramble, puzzle } }) },
  solves: {
    save: async () => ({ status: 'success', data: undefined }),
    get: async () => ({ status: 'success', data: null }),
    list: async () => ({ status: 'success', data: [] }),
    updatePenalty: async () => ({ status: 'success', data: undefined }),
  },
  analysis: { analyze: async () => ({ status: 'unavailable', reason: 'UNSUPPORTED' }) },
};

const nativeShowModal = HTMLDialogElement.prototype.showModal;
const nativeClose = HTMLDialogElement.prototype.close;

beforeAll(() => {
  if (!HTMLDialogElement.prototype.showModal) {
    HTMLDialogElement.prototype.showModal = function showModal() {
      this.setAttribute('open', '');
    };
  }
  if (!HTMLDialogElement.prototype.close) {
    HTMLDialogElement.prototype.close = function close() {
      this.removeAttribute('open');
    };
  }
});

afterAll(() => {
  if (nativeShowModal) HTMLDialogElement.prototype.showModal = nativeShowModal;
  if (nativeClose) HTMLDialogElement.prototype.close = nativeClose;
});

beforeEach(() => {
  window.history.replaceState(null, '', '/');
});

function renderApp(path = '/') {
  window.history.replaceState(null, '', path);
  return render(<AppProviders services={testServices}><App /></AppProviders>);
}

describe('application shell and routes', () => {
  it('opens a directly requested route and marks the active navigation link', () => {
    renderApp('/solves');
    expect(screen.getByRole('heading', { name: 'Solves', level: 1 })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Solves' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('main')).toHaveAttribute('id', 'main-content');
  });

  it.each([
    ['/timer', 'Timer'],
    ['/statistics', 'Statistics'],
    ['/analyze', 'Analyze'],
    ['/challenges', 'Challenges'],
  ])('renders %s directly with an explicit feature state', async (path, title) => {
    renderApp(path);
    expect(screen.getByRole('heading', { name: title, level: 1 })).toBeInTheDocument();
    if (path === '/statistics') {
      expect(screen.getByRole('heading', { name: 'Statistics are not available yet' })).toBeInTheDocument();
    } else if (path === '/analyze') {
      expect(screen.getByRole('heading', { name: 'Analysis unavailable' })).toBeInTheDocument();
    } else if (path === '/challenges') {
      expect(screen.getByRole('heading', { name: 'Challenge participation unavailable' })).toBeInTheDocument();
    } else if (path === '/timer') {
      const scrambleRegion = screen.getByRole('region', { name: 'Current scramble' });
      expect(await within(scrambleRegion).findByText(scramble.notation)).toBeInTheDocument();
      expect(within(scrambleRegion).getByRole('status')).toHaveTextContent('Ready');
    } else {
      expect(within(screen.getByRole('main')).getByRole('status')).toHaveTextContent('Unavailable');
    }
  });

  it('keeps the Scramble History route available without a primary navigation entry', async () => {
    renderApp('/scrambles');
    expect(await screen.findByRole('heading', { name: 'Scramble history', level: 1 })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Scramble history' })).not.toBeInTheDocument();
  });

  it('navigates by keyboard, updates focus, and supports browser back/forward', async () => {
    const user = userEvent.setup();
    renderApp('/timer');

    await user.click(screen.getByRole('link', { name: 'Solves' }));
    expect(await screen.findByRole('heading', { name: 'Solves', level: 1 })).toBeInTheDocument();
    expect(screen.getByRole('main')).toHaveFocus();

    window.history.back();
    await waitFor(() => expect(screen.getByRole('heading', { name: 'Timer', level: 1 })).toBeInTheDocument());
    window.history.forward();
    await waitFor(() => expect(screen.getByRole('heading', { name: 'Solves', level: 1 })).toBeInTheDocument());
  });

  it('provides a skip link and a usable mobile navigation dialog', async () => {
    const user = userEvent.setup();
    renderApp('/timer');
    const skipLink = screen.getByRole('link', { name: 'Skip to content' });
    expect(skipLink).toHaveAttribute('href', '#main-content');

    const menuButton = screen.getByRole('button', { name: 'Open navigation menu' });
    menuButton.focus();
    await user.keyboard('{Enter}');
    expect(menuButton).toHaveAttribute('aria-expanded', 'true');
    const dialog = screen.getByRole('dialog', { name: 'Navigation' });
    const solvesLink = within(dialog).getByRole('link', { name: 'Solves' });
    solvesLink.focus();
    await user.keyboard('{Enter}');

    expect(await screen.findByRole('heading', { name: 'Solves', level: 1 })).toBeInTheDocument();
    await waitFor(() => expect(dialog).not.toHaveAttribute('open'));
    expect(menuButton).toHaveAttribute('aria-expanded', 'false');
    expect(screen.getByRole('main')).toHaveFocus();
  });

  it('renders the existing theme controls on Settings and handles unknown URLs', () => {
    const { unmount } = renderApp('/settings');
    expect(screen.getByRole('heading', { name: 'Settings', level: 1 })).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: 'Color theme' })).toBeInTheDocument();
    unmount();

    renderApp('/not-a-route');
    expect(screen.getByRole('heading', { name: 'Page not found', level: 1 })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Go to Timer' })).toHaveAttribute('href', '/timer');
  });

  it('keeps the Timer shell within the existing dark theme provider', async () => {
    const user = userEvent.setup();
    renderApp('/settings');

    await user.selectOptions(screen.getByRole('combobox', { name: 'Color theme' }), 'dark');
    await waitFor(() => expect(document.documentElement).toHaveAttribute('data-theme', 'dark'));
    await user.click(screen.getByRole('link', { name: 'Timer' }));

    expect(await screen.findByRole('heading', { name: 'Timer', level: 1 })).toBeInTheDocument();
    expect(document.documentElement).toHaveAttribute('data-theme', 'dark');
    expect(screen.getByRole('combobox', { name: 'Puzzle type' })).toBeInTheDocument();
  });
});
