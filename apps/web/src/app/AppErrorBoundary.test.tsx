import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { AppErrorBoundary } from './AppErrorBoundary';

function BrokenChild(): never {
  throw new Error('Intentional test failure');
}

let shouldThrow = true;
function RecoverableChild() {
  if (shouldThrow) throw new Error('Temporary render failure');
  return <p>Recovered page</p>;
}

describe('AppErrorBoundary', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    shouldThrow = true;
  });

  it('shows a recovery message when a descendant throws during rendering', () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);

    render(
      <>
        <nav aria-label="Persistent application navigation"><a href="/timer">Timer</a></nav>
        <AppErrorBoundary><BrokenChild /></AppErrorBoundary>
      </>,
    );

    expect(screen.getByRole('alert')).toHaveTextContent(
      'RubiVision AI is unavailable',
    );
    expect(screen.getByRole('navigation', { name: 'Persistent application navigation' })).toBeInTheDocument();
    expect(screen.getByText(/You can try rendering it again/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Try again' })).toBeInTheDocument();
  });

  it('retries a failed subtree without reloading the application', () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    render(<AppErrorBoundary><RecoverableChild /></AppErrorBoundary>);
    expect(screen.getByRole('alert')).toBeInTheDocument();

    shouldThrow = false;
    fireEvent.click(screen.getByRole('button', { name: 'Try again' }));

    expect(screen.getByText('Recovered page')).toBeInTheDocument();
  });

  it('does not include exception details in its development log', () => {
    const log = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const boundary = new AppErrorBoundary({ children: null });

    Reflect.apply(boundary.componentDidCatch, boundary, [
      new Error('private solve details'),
      { componentStack: 'private component stack' },
    ]);

    expect(log.mock.calls).toEqual([['Application render failed.']]);
  });
});
