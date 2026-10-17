import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { AppProviders } from './AppProviders';
import { App } from './App';

describe('AppProviders', () => {
  it('mounts the app inside its router and error boundary providers', () => {
    render(
      <AppProviders>
        <App />
      </AppProviders>,
    );

    expect(screen.getAllByRole('link', { name: 'RubiVision AI' })).toHaveLength(2);
    expect(screen.getAllByRole('link', { name: 'RubiVision AI' }).every((link) => link.getAttribute('href') === '/timer')).toBe(true);
    expect(screen.getByRole('heading', { name: 'Timer', level: 1 })).toBeInTheDocument();
    expect(screen.getByRole('group', { name: 'Profile' })).toHaveTextContent('Guest');
  });
});
