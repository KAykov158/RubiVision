import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { AppProviders } from './AppProviders';
import { App } from './App';

describe('App routing', () => {
  it('redirects the root URL to the public Timer page with a read-only scramble placeholder', () => {
    window.history.replaceState(null, '', '/');
    render(<AppProviders><App /></AppProviders>);

    expect(screen.getByRole('heading', { name: 'Timer', level: 1 })).toBeInTheDocument();
    expect(screen.getByText('Scramble generation is unavailable because no scramble service is configured.')).toBeInTheDocument();
    expect(screen.queryByRole('textbox', { name: 'Exact scramble snapshot' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Timer control' })).toBeEnabled();
    expect(screen.getByRole('link', { name: 'Timer' })).toHaveAttribute('aria-current', 'page');
  });
});
