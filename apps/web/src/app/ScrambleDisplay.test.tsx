import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { Scramble } from '../shared/domain/contracts';
import { ScrambleDisplay } from './ScrambleDisplay';

const scramble: Scramble = {
  id: '59d8f96e-5df3-4a26-a55f-340d491b1f02',
  puzzle: '333',
  notation: "R U R' U' F2 D2 L2 B'",
  generatorVersion: 'test-fixture',
  createdAt: '2026-10-17T00:00:00.000Z',
};

describe('ScrambleDisplay', () => {
  it('renders notation supplied through the existing scramble domain contract', () => {
    render(<ScrambleDisplay scramble={scramble} unavailableMessage="Scramble unavailable" />);

    expect(screen.getByText(scramble.notation)).toHaveClass('timer-page__scramble-notation');
    expect(screen.queryByText('Scramble unavailable')).not.toBeInTheDocument();
  });

  it('keeps generation visibly unavailable when no scramble is supplied', () => {
    render(<ScrambleDisplay scramble={null} unavailableMessage="Scramble generation is unavailable." />);

    expect(screen.getByText('Scramble generation is unavailable.')).toHaveClass('timer-page__scramble-empty');
    expect(screen.queryByText(scramble.notation)).not.toBeInTheDocument();
  });
});
