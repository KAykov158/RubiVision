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
    expect(screen.getByRole('status')).toHaveTextContent('Unavailable');
    expect(screen.getByText(/No sample solves are shown/)).toBeInTheDocument();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  it('provides a labeled, keyboard-operable puzzle selector for all supported puzzle types', async () => {
    const user = userEvent.setup();
    renderTimerPage();
    const puzzle = screen.getByRole('combobox', { name: 'Puzzle type' });

    expect(within(puzzle).getAllByRole('option')).toHaveLength(6);
    expect(puzzle).toHaveValue('333');
    puzzle.focus();
    await user.selectOptions(puzzle, '444');
    expect(puzzle).toHaveValue('444');
    expect(screen.getByText((_, node) => node?.textContent === 'Selected puzzle: 4×4')).toBeInTheDocument();
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
    expect(screen.getByText('Statistics are not available until persisted solves and a statistics service are configured.')).toBeInTheDocument();
    expect(screen.getAllByText('—')).toHaveLength(4);
  });
});
