import { useEffect, useRef, useState } from 'react';
import type { TwistyPlayer } from 'cubing/twisty';
import type { PuzzleType, Scramble } from '../shared/domain/contracts';
import { validateScramble } from '../features/scrambles/scrambleService';

type VisualizationMode = '2D' | '3D';
type PreviewState = 'idle' | 'loading' | 'ready' | 'error';
type PreviewResult = { requestKey: string; mode: VisualizationMode; status: 'ready' | 'error'; message?: string };
type ViewerModule = { TwistyPlayer: typeof TwistyPlayer };
export type CubePreviewLoader = () => Promise<ViewerModule>;
const loadViewerModule: CubePreviewLoader = () => import('cubing/twisty');

export function ScrambleCubePreview({
  puzzle,
  scramble,
  loadViewer = loadViewerModule,
}: {
  puzzle: PuzzleType;
  scramble: Scramble | null;
  loadViewer?: CubePreviewLoader;
}) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<VisualizationMode>('2D');
  const [result, setResult] = useState<PreviewResult | null>(null);
  const viewerHost = useRef<HTMLDivElement>(null);
  const requestKey = scramble ? `${scramble.id}:${scramble.puzzle}:${scramble.notation}` : '';
  const validation = scramble?.puzzle === '333' ? validateScramble('333', scramble.notation) : null;
  const invalidScramble = Boolean(validation && validation.status !== 'success');
  const currentResult = result?.requestKey === requestKey && result.mode === mode ? result : null;
  const state: PreviewState = !open ? 'idle'
    : !scramble || scramble.puzzle !== '333' ? 'idle'
      : invalidScramble ? 'error'
        : currentResult?.status ?? 'loading';
  const errorMessage = invalidScramble
    ? 'This scramble cannot be shown as a cube preview. The original notation is unchanged.'
    : currentResult?.message ?? '';

  useEffect(() => {
    if (!open || puzzle !== '333' || !scramble || scramble.puzzle !== '333' || invalidScramble) {
      viewerHost.current?.replaceChildren();
      return;
    }

    const host = viewerHost.current;
    let active = true;
    let player: TwistyPlayer | null = null;
    host?.replaceChildren();

    void loadViewer().then(({ TwistyPlayer }) => {
      if (!active || !host) return;
      player = new TwistyPlayer({
        puzzle: '3x3x3',
        experimentalSetupAlg: scramble.notation,
        visualization: mode,
        background: 'none',
        controlPanel: 'none',
      });
      player.classList.add('timer-page__cube-player');
      // cubing.js size-contains this grid wrapper; an explicit fill prevents zero-height collapse in nested grid layouts.
      player.contentWrapper.style.height = '100%';
      player.setAttribute('aria-label', '3×3 cube state after the displayed scramble');
      player.experimentalModel.userVisibleErrorTracker.addFreshListener(({ errors }) => {
        if (!active || errors.length === 0) return;
        player?.remove();
        host.replaceChildren();
        setResult({ requestKey, mode, status: 'error', message: 'Cube preview could not render. The scramble and timer are still available.' });
      });
      host.replaceChildren(player);
      setResult({ requestKey, mode, status: 'ready' });
    }).catch(() => {
      if (!active) return;
      setResult({ requestKey, mode, status: 'error', message: 'Cube preview could not load. The scramble and timer are still available.' });
    });

    return () => {
      active = false;
      player?.remove();
      host?.replaceChildren();
    };
  }, [invalidScramble, loadViewer, mode, open, puzzle, requestKey, scramble]);

  if (puzzle !== '333') {
    return <p className="timer-page__hint" role="status">Cube preview currently supports 3×3 scrambles. Your scramble remains available above.</p>;
  }

  return (
    <section aria-label="Optional scramble cube preview" className="timer-page__cube-preview">
      <div className="timer-page__cube-preview-heading">
        <p className="timer-page__hint">Mathematical preview of the displayed scramble, not physical cube tracking.</p>
        <ButtonLike expanded={open} onClick={() => {
          if (open) setResult(null);
          setOpen(!open);
        }} />
      </div>
      {open && <div className="timer-page__cube-preview-content">
        {scramble?.puzzle === '333' ? <>
          <div aria-label="Visualization mode" className="timer-page__cube-preview-modes" role="group">
            {(['2D', '3D'] as const).map((visualization) => (
              <button
                aria-pressed={mode === visualization}
                className="rv-button rv-button--secondary timer-page__cube-preview-mode"
                key={visualization}
                onClick={() => setMode(visualization)}
                type="button"
              >
                {visualization}
              </button>
            ))}
          </div>
          <p className="rv-visually-hidden" aria-live="polite" role="status">
            {state === 'loading' ? 'Loading cube preview.' : state === 'ready' ? `Showing ${mode} preview for the current scramble.` : ''}
          </p>
          {state === 'error' && <p className="timer-page__hint" role="status">{errorMessage}</p>}
          {state === 'loading' && <span className="timer-page__hint">Loading cube preview…</span>}
          <div
            aria-busy={state === 'loading'}
            className={`timer-page__cube-preview-viewer${state === 'ready' ? ' is-ready' : ''}`}
            data-scramble-id={scramble.id}
            ref={viewerHost}
          />
        </> : <p className="timer-page__hint" role="status">Generate a 3×3 scramble to preview its cube state.</p>}
      </div>}
    </section>
  );
}

function ButtonLike({ expanded, onClick }: { expanded: boolean; onClick: () => void }) {
  return (
    <button
      aria-expanded={expanded}
      className="rv-button rv-button--secondary timer-page__cube-preview-toggle"
      onClick={onClick}
      type="button"
    >
      {expanded ? 'Hide cube preview' : 'Show cube preview'}
    </button>
  );
}
