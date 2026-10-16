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

    expect(screen.getByRole('link', { name: 'RubiVision AI' })).toHaveAttribute('href', '/timer');
    expect(screen.getByRole('heading', { name: 'Timer', level: 1 })).toBeInTheDocument();
  });
});
