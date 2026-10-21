import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { TwistyPlayer as TwistyPlayerType } from 'cubing/twisty';
import type { PuzzleType, Scramble } from '../shared/domain/contracts';
import { buildCubeNetSvg } from './cubeNetPreview';
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

function makeCubeNet(notation: string) {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('data-notation', notation);
  return svg;
}

const scramble: Scramble = {
  id: '11111111-1111-4111-8111-111111111111',
  puzzle: '333',
  notation: "R U R' U'",
  generatorVersion: 'cubing.js 0.66.1',
  createdAt: '2026-10-18T12:00:00.000Z',
};

describe('optional scramble cube preview', () => {
  it('renders a 2D net lazily from exact notation and opens the same scramble in 3D', async () => {
    viewerMock.instances = [];
    viewerMock.shouldThrow = false;
    const loadViewer = vi.fn(async () => makeViewerModule());
    const loadCubeNet = vi.fn(async (notation: string) => makeCubeNet(notation));
    render(<ScrambleCubePreview loadCubeNet={loadCubeNet} loadViewer={loadViewer} puzzle="333" scramble={scramble} />);

    const trigger = screen.getByRole('button', { name: 'Cube Preview View in 3D' });
    expect(trigger.tagName).toBe('BUTTON');
    expect(trigger).toHaveAttribute('aria-haspopup', 'dialog');
    await waitFor(() => expect(loadCubeNet).toHaveBeenCalledWith(scramble.notation));
    expect(loadViewer).not.toHaveBeenCalled();
    expect(trigger.querySelector('svg')?.getAttribute('data-notation')).toBe(scramble.notation);
    expect(trigger.querySelector('[data-scramble-id]')).toHaveAttribute('data-scramble-id', scramble.id);

    fireEvent.click(trigger);
    const dialog = screen.getByRole('dialog', { name: 'Cube Preview' });
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(screen.getByRole('button', { name: 'Close cube preview' })).toHaveFocus();
    await waitFor(() => expect(viewerMock.instances).toHaveLength(1));
    expect(loadViewer).toHaveBeenCalledOnce();
    expect(viewerMock.instances[0]?.config).toMatchObject({
      puzzle: '3x3x3',
      experimentalSetupAlg: scramble.notation,
      visualization: '3D',
      controlPanel: 'none',
    });
    expect(viewerMock.instances[0]?.config.experimentalSetupAlg).toBe(loadCubeNet.mock.calls[0]?.[0]);
  });

  it('closes by Escape and backdrop, traps focus, and returns focus to the card', async () => {
    viewerMock.instances = [];
    viewerMock.shouldThrow = false;
    const { container } = render(<ScrambleCubePreview loadCubeNet={async (notation) => makeCubeNet(notation)} loadViewer={async () => makeViewerModule()} puzzle="333" scramble={scramble} />);
    const trigger = screen.getByRole('button', { name: 'Cube Preview View in 3D' });
    fireEvent.click(trigger);
    const close = screen.getByRole('button', { name: 'Close cube preview' });
    expect(close).toHaveFocus();
    fireEvent.keyDown(close, { key: 'Tab' });
    expect(close).toHaveFocus();
    fireEvent.keyDown(close, { key: 'Tab', shiftKey: true });
    expect(close).toHaveFocus();
    await waitFor(() => expect(viewerMock.instances).toHaveLength(1));

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
    expect(viewerMock.instances[0]?.element.isConnected).toBe(false);

    fireEvent.click(trigger);
    const backdrop = container.querySelector('.timer-page__cube-dialog-backdrop');
    await waitFor(() => expect(viewerMock.instances).toHaveLength(2));
    fireEvent.click(backdrop!);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('updates the net on regeneration and ignores a stale asynchronous result', async () => {
    let resolveOld!: (value: SVGSVGElement) => void;
    const loadCubeNet = vi.fn()
      .mockImplementationOnce(() => new Promise<SVGSVGElement>((resolve) => { resolveOld = resolve; }))
      .mockImplementation(async (notation: string) => makeCubeNet(notation));
    const { rerender } = render(<ScrambleCubePreview loadCubeNet={loadCubeNet} puzzle="333" scramble={scramble} />);
    await waitFor(() => expect(loadCubeNet).toHaveBeenCalledTimes(1));

    const regenerated = { ...scramble, id: '22222222-2222-4222-8222-222222222222', notation: 'F2 U R2' };
    rerender(<ScrambleCubePreview loadCubeNet={loadCubeNet} puzzle="333" scramble={regenerated} />);
    await waitFor(() => expect(loadCubeNet).toHaveBeenCalledTimes(2));
    const net = screen.getByRole('button', { name: 'Cube Preview View in 3D' }).querySelector('svg');
    await waitFor(() => expect(net).toHaveAttribute('data-notation', regenerated.notation));
    expect(screen.getByRole('button', { name: 'Cube Preview View in 3D' }).querySelector('[data-scramble-id]'))
      .toHaveAttribute('data-scramble-id', regenerated.id);

    resolveOld(makeCubeNet(scramble.notation));
    await Promise.resolve();
    await Promise.resolve();
    expect(screen.getByRole('button', { name: 'Cube Preview View in 3D' }).querySelector('svg'))
      .toHaveAttribute('data-notation', regenerated.notation);
  });

  it('shows a compact unsupported-puzzle fallback without loading either renderer', () => {
    viewerMock.instances = [];
    const loadViewer = vi.fn(async () => makeViewerModule());
    const loadCubeNet = vi.fn(async (notation: string) => makeCubeNet(notation));
    render(<ScrambleCubePreview loadCubeNet={loadCubeNet} loadViewer={loadViewer} puzzle={'222' as PuzzleType} scramble={{ ...scramble, puzzle: '222' }} />);
    const card = screen.getByRole('button', { name: 'Cube Preview View in 3D' });
    expect(card).toHaveTextContent('3×3 only');
    fireEvent.click(card);
    expect(screen.getByRole('dialog').querySelector('[role="status"]')).toHaveTextContent('currently supports 3×3 scrambles');
    expect(loadCubeNet).not.toHaveBeenCalled();
    expect(loadViewer).not.toHaveBeenCalled();
  });

  it('shows a compact 2D fallback and keeps the card usable if SVG rendering fails', async () => {
    viewerMock.instances = [];
    const loadViewer = vi.fn(async () => makeViewerModule());
    const loadCubeNet = vi.fn(async () => { throw new Error('2D preview unavailable'); });
    render(<ScrambleCubePreview loadCubeNet={loadCubeNet} loadViewer={loadViewer} puzzle="333" scramble={scramble} />);
    expect(await screen.findByText('Preview unavailable')).toBeInTheDocument();
    const card = screen.getByRole('button', { name: 'Cube Preview View in 3D' });
    fireEvent.click(card);
    await waitFor(() => expect(viewerMock.instances).toHaveLength(1));
    expect(viewerMock.instances[0]?.config.experimentalSetupAlg).toBe(scramble.notation);
  });

  it('isolates viewer construction and rendering failures inside the dialog', async () => {
    viewerMock.instances = [];
    viewerMock.shouldThrow = true;
    const loadViewer = vi.fn(async () => makeViewerModule());
    const loadCubeNet = vi.fn(async (notation: string) => makeCubeNet(notation));
    const { rerender } = render(<ScrambleCubePreview loadCubeNet={loadCubeNet} loadViewer={loadViewer} puzzle="333" scramble={scramble} />);
    fireEvent.click(screen.getByRole('button', { name: 'Cube Preview View in 3D' }));
    expect(await screen.findByText('Cube preview could not load. The scramble and timer are still available.')).toBeInTheDocument();
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    viewerMock.shouldThrow = false;
    rerender(<ScrambleCubePreview loadCubeNet={loadCubeNet} loadViewer={loadViewer} puzzle="333" scramble={{ ...scramble, id: '33333333-3333-4333-8333-333333333333' }} />);
    await waitFor(() => expect(viewerMock.instances).toHaveLength(1));
    viewerMock.instances[0]?.reportError();
    expect(await screen.findByText('Cube preview could not render. The scramble and timer are still available.')).toBeInTheDocument();
    expect(viewerMock.instances[0]?.element.isConnected).toBe(false);
  });
});

describe('cubing.js 2D cube net', () => {
  it('maps cubie sticker colors from the exact 3×3 KPuzzle state', async () => {
    const net = await buildCubeNetSvg('U');
    expect(net.getAttribute('viewBox')).toBe('8 15 506 406');
    expect(net.querySelector('[id="EDGES-l0-o1"]')?.getAttribute('style')).toContain('fill: red');

    const solved = await buildCubeNetSvg('');
    expect(net.querySelector('[id="EDGES-l0-o1"]')?.getAttribute('style'))
      .not.toBe(solved.querySelector('[id="EDGES-l0-o1"]')?.getAttribute('style'));
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
