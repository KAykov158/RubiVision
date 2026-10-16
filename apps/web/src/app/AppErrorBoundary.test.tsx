import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { AppErrorBoundary } from './AppErrorBoundary';

function BrokenChild(): never {
  throw new Error('Intentional test failure');
}

describe('AppErrorBoundary', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('shows a recovery message when a descendant throws during rendering', () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);

    render(
      <AppErrorBoundary>
        <BrokenChild />
      </AppErrorBoundary>,
    );

    expect(screen.getByRole('alert')).toHaveTextContent(
      'RubiVision AI is unavailable',
    );
    expect(screen.getByText('Reload the page to try again.')).toBeInTheDocument();
  });
});
