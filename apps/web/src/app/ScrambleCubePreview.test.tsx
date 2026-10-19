import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { TwistyPlayer as TwistyPlayerType } from 'cubing/twisty';
import type { PuzzleType, Scramble } from '../shared/domain/contracts';
import { ScrambleCubePreview } from './ScrambleCubePreview';

const viewerMock: { instances: Array<{ config: Record<string, unknown>; element: HTMLElement; reportError: () => void }>; shouldThrow: boolean } = { instances: [], shouldThrow: false };

function makeViewerModule() {
  const MockPlayer = class {
    constructor(config: Record<string, unknown>) {
      if (viewerMock.shouldThrow) throw new Error('viewer unavailable');
      const element = document.createElement('twisty-player');
      let reportError: (value: { errors: string[] }) => void = () => {};
      Object.assign(element, {
        contentWrapper: document.createElement('div'),
        experimentalModel: { userVisibleErrorTracker: { addFreshListener: (listener: typeof reportError) => { reportError = listener; } } },
      });
      viewerMock.instances.push({ config, element, reportError: () => reportError({ errors: ['render failure'] }) });
      return element;
    }
  };
  return { TwistyPlayer: MockPlayer as unknown as typeof TwistyPlayerType };
}

const scramble: Scramble = {
  id: '11111111-1111-4111-8111-111111111111',
  puzzle: '333',
  notation: "R U R' U'",
  generatorVersion: 'cubing.js 0.66.1',
  createdAt: '2026-10-18T12:00:00.000Z',
};

async function flushImport() {
  await Promise.resolve();
  await Promise.resolve();
  await Promise.resolve();
}

describe('optional scramble cube preview', () => {
  it('does not load cubing visualization until opened and associates the exact displayed scramble', async () => {
    viewerMock.instances = [];
    viewerMock.shouldThrow = false;
    const loadViewer = vi.fn(async () => makeViewerModule());
    const { rerender } = render(<ScrambleCubePreview loadViewer={loadViewer} puzzle="333" scramble={scramble} />);
    expect(viewerMock.instances).toHaveLength(0);
    expect(loadViewer).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: 'Show cube preview' }));
    await waitFor(() => expect(viewerMock.instances).toHaveLength(1));
    expect(loadViewer).toHaveBeenCalledOnce();
    expect(viewerMock.instances[0]?.config).toMatchObject({
      puzzle: '3x3x3',
      experimentalSetupAlg: scramble.notation,
      visualization: '2D',
      controlPanel: 'none',
    });
    expect(viewerMock.instances[0]?.element).toHaveAttribute('aria-label', '3×3 cube state after the displayed scramble');
    expect((viewerMock.instances[0]?.element as HTMLElement & { contentWrapper: HTMLDivElement }).contentWrapper.style.height).toBe('100%');

    const regenerated = { ...scramble, id: '22222222-2222-4222-8222-222222222222', notation: 'F2 U R2' };
    rerender(<ScrambleCubePreview loadViewer={loadViewer} puzzle="333" scramble={regenerated} />);
    await waitFor(() => expect(viewerMock.instances).toHaveLength(2));
    expect(viewerMock.instances[0]?.element.isConnected).toBe(false);
    expect(viewerMock.instances[1]?.config.experimentalSetupAlg).toBe(regenerated.notation);
    expect(screen.getByLabelText('Optional scramble cube preview').querySelector('[data-scramble-id]'))
      .toHaveAttribute('data-scramble-id', regenerated.id);
  });

  it('drops an obsolete pending viewer import when a newer scramble arrives', async () => {
    viewerMock.instances = [];
    let resolveOld!: (value: ReturnType<typeof makeViewerModule>) => void;
    const loadViewer = vi.fn()
      .mockImplementationOnce(() => new Promise<ReturnType<typeof makeViewerModule>>((resolve) => { resolveOld = resolve; }))
      .mockImplementationOnce(async () => makeViewerModule());
    const { rerender } = render(<ScrambleCubePreview loadViewer={loadViewer} puzzle="333" scramble={scramble} />);
    fireEvent.click(screen.getByRole('button', { name: 'Show cube preview' }));
    const newer = { ...scramble, id: '33333333-3333-4333-8333-333333333333', notation: 'L2 D B' };
    rerender(<ScrambleCubePreview loadViewer={loadViewer} puzzle="333" scramble={newer} />);
    await waitFor(() => expect(viewerMock.instances).toHaveLength(1));
    resolveOld(makeViewerModule());
    await flushImport();

    expect(viewerMock.instances).toHaveLength(1);
    expect(viewerMock.instances.map(({ config }) => config.experimentalSetupAlg)).toEqual([newer.notation]);
  });

  it('supports accessible 2D and 3D switching and removes the viewer when hidden', async () => {
    viewerMock.instances = [];
    viewerMock.shouldThrow = false;
    const loadViewer = vi.fn(async () => makeViewerModule());
    render(<ScrambleCubePreview loadViewer={loadViewer} puzzle="333" scramble={scramble} />);
    fireEvent.click(screen.getByRole('button', { name: 'Show cube preview' }));
    await waitFor(() => expect(viewerMock.instances).toHaveLength(1));

    const mode3d = screen.getByRole('button', { name: '3D' });
    expect(screen.getByRole('button', { name: '2D' })).toHaveAttribute('aria-pressed', 'true');
    fireEvent.click(mode3d);
    await waitFor(() => expect(viewerMock.instances).toHaveLength(2));
    expect(mode3d).toHaveAttribute('aria-pressed', 'true');
    expect(viewerMock.instances[1]?.config.visualization).toBe('3D');

    fireEvent.click(screen.getByRole('button', { name: 'Hide cube preview' }));
    expect(viewerMock.instances[1]?.element.isConnected).toBe(false);
    fireEvent.click(screen.getByRole('button', { name: 'Show cube preview' }));
    await waitFor(() => expect(viewerMock.instances).toHaveLength(3));
    expect(viewerMock.instances[2]?.config.experimentalSetupAlg).toBe(scramble.notation);
  });

  it('shows a clear unsupported-puzzle fallback without importing the viewer', () => {
    viewerMock.instances = [];
    const loadViewer = vi.fn(async () => makeViewerModule());
    render(<ScrambleCubePreview loadViewer={loadViewer} puzzle={'222' as PuzzleType} scramble={{ ...scramble, puzzle: '222' }} />);
    expect(screen.getByRole('status')).toHaveTextContent('currently supports 3×3 scrambles');
    expect(screen.queryByRole('button', { name: 'Show cube preview' })).not.toBeInTheDocument();
    expect(viewerMock.instances).toHaveLength(0);
    expect(loadViewer).not.toHaveBeenCalled();
  });

  it('isolates a viewer construction failure and retains the scramble preview controls', async () => {
    viewerMock.instances = [];
    viewerMock.shouldThrow = true;
    const loadViewer = vi.fn(async () => makeViewerModule());
    render(<ScrambleCubePreview loadViewer={loadViewer} puzzle="333" scramble={scramble} />);
    fireEvent.click(screen.getByRole('button', { name: 'Show cube preview' }));

    expect(await screen.findByText('Cube preview could not load. The scramble and timer are still available.'))
      .toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Hide cube preview' })).toBeEnabled();
  });

  it('contains cubing.js render errors inside the preview', async () => {
    viewerMock.instances = [];
    viewerMock.shouldThrow = false;
    const loadViewer = vi.fn(async () => makeViewerModule());
    render(<ScrambleCubePreview loadViewer={loadViewer} puzzle="333" scramble={scramble} />);
    fireEvent.click(screen.getByRole('button', { name: 'Show cube preview' }));
    await waitFor(() => expect(viewerMock.instances).toHaveLength(1));
    viewerMock.instances[0]?.reportError();

    expect(await screen.findByText('Cube preview could not render. The scramble and timer are still available.')).toBeInTheDocument();
    expect(viewerMock.instances[0]?.element.isConnected).toBe(false);
  });
});

describe('3×3 scramble inverse state', () => {
  it('returns the viewer puzzle model to solved after a scramble and its inverse', async () => {
    const [{ Alg }, { cube3x3x3 }] = await Promise.all([import('cubing/alg'), import('cubing/puzzles')]);
    const kpuzzle = await cube3x3x3.kpuzzle();
    const alg = Alg.fromString(scramble.notation);
    const roundTrip = alg.concat(alg.invert());

    expect(kpuzzle.algToTransformation(alg).isIdentityTransformation()).toBe(false);
    expect(kpuzzle.algToTransformation(roundTrip).isIdentityTransformation()).toBe(true);
  });
});
