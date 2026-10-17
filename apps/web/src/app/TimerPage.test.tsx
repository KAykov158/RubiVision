import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { AppProviders } from './AppProviders';
import { TimerPageShell } from './TimerPage';

function renderTimerPage() {
  return render(<AppProviders><TimerPageShell /></AppProviders>);
}

describe('Timer page shell', () => {
  it('renders the timer hierarchy and honest unavailable states without sample solves', () => {
    renderTimerPage();

    expect(screen.getByRole('main')).toHaveAttribute('id', 'main-content');
    expect(screen.getByRole('heading', { name: 'Timer', level: 1 })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Current scramble' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Timer display' })).toBeInTheDocument();
    expect(screen.getByText('Scramble generation is unavailable because no scramble service is configured.')).toBeInTheDocument();
    expect(screen.queryByText(/R U R/)).not.toBeInTheDocument();
    const scramblePanel = screen.getByRole('heading', { name: 'Current scramble' }).closest('.timer-page__scramble');
    const timerReadout = screen.getByRole('heading', { name: 'Timer display' }).closest('.timer-page__readout');
    expect(scramblePanel && timerReadout && (scramblePanel.compareDocumentPosition(timerReadout) & Node.DOCUMENT_POSITION_FOLLOWING) !== 0).toBe(true);
    expect(screen.getByRole('status')).toHaveTextContent('Unavailable');
    expect(screen.getByText(/No sample solves are shown/)).toBeInTheDocument();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  it('renders the session overview without inventing current, best, or historical values', () => {
    renderTimerPage();

    expect(screen.getByRole('heading', { name: 'Session overview' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Recent solves' })).toBeInTheDocument();
    expect(screen.getByText('Single')).toBeInTheDocument();
    expect(screen.getAllByLabelText('Not calculated')).toHaveLength(9);
    expect(screen.getByText(/No sample solves are shown/)).toBeInTheDocument();
  });

  it('provides a labeled puzzle selector for all supported puzzle types', async () => {
    const user = userEvent.setup();
    renderTimerPage();
    const puzzle = screen.getByRole('combobox', { name: 'Puzzle type' });
    const session = screen.getByRole('combobox', { name: 'Session' });

    expect(within(puzzle).getAllByRole('option')).toHaveLength(6);
    expect(puzzle).toHaveValue('333');
    expect(session).toBeDisabled();
    expect(within(session).getByRole('option')).toHaveTextContent('Unavailable');
    expect(session).toHaveAttribute('aria-describedby', 'timer-session-hint');
    expect(screen.getByText('Session selection will be available when session services are configured.')).toBeInTheDocument();
    expect(document.querySelectorAll('.timer-page__selector-icon')).toHaveLength(2);
    puzzle.focus();
    await user.selectOptions(puzzle, '444');
    expect(puzzle).toHaveValue('444');
    for (const value of ['222', '333', '444', '555', '666', '777']) {
      await user.selectOptions(puzzle, value);
      expect(puzzle).toHaveValue(value);
      expect(screen.getByText(/^Selected puzzle:/)).toHaveTextContent(`${value[0]}\u00D7${value[0]}\u00D7${value[0]}`);
    }
    expect(screen.getByText(/^Selected puzzle:/)).toHaveTextContent('7\u00D77\u00D77');
  });

  it('keeps unavailable session and timer actions disabled and has no active keyboard shortcut', async () => {
    const user = userEvent.setup();
    renderTimerPage();
    const session = screen.getByRole('combobox', { name: 'Session' });
    const start = screen.getByRole('button', { name: 'Start timer' });
    const stop = screen.getByRole('button', { name: 'Stop timer' });

    expect(session).toBeDisabled();
    expect(start).toBeDisabled();
    expect(stop).toBeDisabled();
    await user.keyboard(' ');
    expect(screen.getByRole('button', { name: 'Start timer' })).toBeDisabled();
    expect(screen.getByRole('status')).toHaveTextContent('Unavailable');
  });

  it('labels the visualization placeholder and statistics that have no backing data', () => {
    renderTimerPage();

    expect(screen.getByRole('img', { name: 'Visualization is unavailable until a scramble and visualization service are connected.' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Best' })).toBeInTheDocument();
    expect(screen.getAllByText('Statistics are not available until persisted solves and a statistics service are configured.')).toHaveLength(2);
    expect(screen.getAllByText('—')).toHaveLength(10);
  });
});
