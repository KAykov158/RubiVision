import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { OperationFailureNotice, RouteState, type OperationFailureKind } from './RouteState';

describe('route state placeholders', () => {
  it('announces loading and distinguishes an empty result', () => {
    const { rerender } = render(<RouteState state="loading" />);
    expect(screen.getByRole('status', { name: 'Loading page content' })).toBeInTheDocument();
    expect(screen.getByRole('region', { name: 'Loading page content' })).toHaveAttribute('aria-busy', 'true');

    rerender(<RouteState state="empty" />);
    expect(screen.getByRole('heading', { name: 'Nothing to show yet' })).toBeInTheDocument();
  });

  it('labels unavailable state and exposes an optional retry action for errors', () => {
    const retry = vi.fn();
    const { rerender } = render(<RouteState state="unavailable" description="No service configured." />);
    expect(screen.getByRole('status')).toHaveTextContent('Unavailable');
    expect(screen.getByText('No service configured.')).toBeInTheDocument();

    rerender(<RouteState state="error" onRetry={retry} />);
    expect(screen.getByRole('alert')).toHaveTextContent('This page could not be loaded');
    fireEvent.click(screen.getByRole('button', { name: 'Try again' }));
    expect(retry).toHaveBeenCalledOnce();
  });

  it.each([
    ['permission-denied', 'Permission denied'],
    ['unsupported', 'Feature unsupported'],
    ['interrupted', 'Operation interrupted'],
    ['malformed-input', 'Input could not be processed'],
    ['cloud-save-unconfirmed', 'Cloud save not confirmed'],
  ] as const satisfies readonly (readonly [OperationFailureKind, string])[])('announces %s with a distinct honest outcome', (kind, title) => {
    render(<OperationFailureNotice kind={kind} />);
    expect(screen.getByRole('alert')).toHaveTextContent(title);
  });
});
