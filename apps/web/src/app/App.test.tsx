import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { AppProviders } from './AppProviders';
import { App } from './App';

describe('App routing', () => {
  it('redirects the root URL to the Timer page shell with honest unavailable sections', () => {
    window.history.replaceState(null, '', '/');
    render(<AppProviders><App /></AppProviders>);

    expect(screen.getByRole('heading', { name: 'Timer', level: 1 })).toBeInTheDocument();
    expect(screen.getByText('Scramble generation is unavailable because no scramble service is configured.')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Timer' })).toHaveAttribute('aria-current', 'page');
  });
});
