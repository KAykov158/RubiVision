import { act, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import type { AppServices, Scramble, ScrambleService } from '../shared/domain/contracts';
import { AppProviders } from './AppProviders';
import { App } from './App';

const scramble: Scramble = {
  id: '9a000000-0000-4000-8000-000000000001',
  puzzle: '333',
  notation: "R U R' U' F2",
  generatorProvider: 'test-provider',
  generatorVersion: 'test-v1',
  generationMethod: 'RANDOM_STATE',
  createdAt: '2026-10-19T12:00:00.000Z',
};

function services(generate: ScrambleService['generate']): AppServices {
  return {
    scrambles: { generate },
    solves: {
      save: async () => ({ status: 'success', data: undefined }),
      get: async () => ({ status: 'success', data: null }),
      list: async () => ({ status: 'success', data: [] }),
      updatePenalty: async () => ({ status: 'success', data: undefined }),
    },
    analysis: { analyze: async () => ({ status: 'unavailable', reason: 'UNSUPPORTED' }) },
  };
}

describe('App routing', () => {
  it('announces scramble loading, then renders the generated scramble and enables timing', async () => {
    let resolveGeneration!: (result: Awaited<ReturnType<ScrambleService['generate']>>) => void;
    const generate = vi.fn(() => new Promise<Awaited<ReturnType<ScrambleService['generate']>>>((resolve) => {
      resolveGeneration = resolve;
    }));
    window.history.replaceState(null, '', '/');
    render(<AppProviders services={services(generate)}><App /></AppProviders>);

    expect(screen.getByRole('heading', { name: 'Timer', level: 1 })).toBeInTheDocument();
    const scrambleRegion = screen.getByRole('region', { name: 'Current scramble' });
    expect(within(scrambleRegion).getAllByRole('status')).toHaveLength(2);
    for (const status of within(scrambleRegion).getAllByRole('status')) {
      expect(status).toHaveTextContent('Generating scramble');
    }
    expect(screen.getByRole('button', { name: 'Timer control' })).toBeDisabled();

    await act(async () => {
      resolveGeneration({ status: 'success', data: scramble });
    });

    expect(await within(scrambleRegion).findByText(scramble.notation)).toBeInTheDocument();
    expect(within(scrambleRegion).getByRole('status')).toHaveTextContent('Ready');
    expect(within(scrambleRegion).getByRole('button', { name: 'Copy Scramble' })).toBeEnabled();
    expect(within(scrambleRegion).getByRole('button', { name: 'New Scramble' })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Timer control' })).toBeEnabled();
    expect(screen.getByRole('link', { name: 'Timer' })).toHaveAttribute('aria-current', 'page');
  });

  it('shows a generation failure and allows a successful retry', async () => {
    const user = userEvent.setup();
    const generate = vi.fn<ScrambleService['generate']>()
      .mockResolvedValueOnce({ status: 'error', code: 'UNKNOWN', message: 'fixture failure' })
      .mockResolvedValueOnce({ status: 'success', data: scramble });
    window.history.replaceState(null, '', '/');
    render(<AppProviders services={services(generate)}><App /></AppProviders>);

    const scrambleRegion = screen.getByRole('region', { name: 'Current scramble' });
    expect(await within(scrambleRegion).findByText('Could not generate this scramble. Try again.')).toBeInTheDocument();
    const statusRegions = within(scrambleRegion).getAllByRole('status');
    expect(statusRegions[0]).toHaveTextContent('Unavailable');
    expect(statusRegions[1]).toHaveTextContent('Could not generate this scramble. Try again.');
    await user.click(within(scrambleRegion).getByRole('button', { name: 'Retry Scramble' }));

    expect(await within(scrambleRegion).findByText(scramble.notation)).toBeInTheDocument();
    expect(generate).toHaveBeenCalledTimes(2);
  });
});
