import { useEffect, useRef, useState } from 'react';
import type { TwistyPlayer } from 'cubing/twisty';
import type { PuzzleType, Scramble } from '../shared/domain/contracts';
import { validateScramble } from '../features/scrambles/scrambleService';
import { buildCubeNetSvg, type CubeNetLoader } from './cubeNetPreview';

type PreviewState = 'loading' | 'ready' | 'error';
type PreviewResult = { requestKey: string; status: 'ready' | 'error'; message?: string };
type ViewerModule = { TwistyPlayer: typeof TwistyPlayer };
export type CubePreviewLoader = () => Promise<ViewerModule>;
const loadViewerModule: CubePreviewLoader = () => import('cubing/twisty');
const loadCubeNet: CubeNetLoader = buildCubeNetSvg;

export function ScrambleCubePreview({
  puzzle,
  scramble,
  loadViewer = loadViewerModule,
  loadCubeNet: loadNet = loadCubeNet,
}: {
  puzzle: PuzzleType;
  scramble: Scramble | null;
  loadViewer?: CubePreviewLoader;
  loadCubeNet?: CubeNetLoader;
}) {
  const [open, setOpen] = useState(false);
  const [result, setResult] = useState<PreviewResult | null>(null);
  const viewerHost = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const requestKey = `${puzzle}:${scramble?.id ?? ''}:${scramble?.puzzle ?? ''}:${scramble?.notation ?? ''}`;
  const supportedScramble = puzzle === '333' && scramble?.puzzle === '333' ? scramble : null;
  const validation = supportedScramble ? validateScramble('333', supportedScramble.notation) : null;
  const invalidScramble = Boolean(validation && validation.status !== 'success');
  const currentResult = result?.requestKey === requestKey ? result : null;
  const state: PreviewState | null = !open || !supportedScramble || invalidScramble
    ? null
    : currentResult?.status ?? 'loading';
  const errorMessage = invalidScramble
    ? 'This scramble cannot be shown as a cube preview. The original notation is unchanged.'
    : currentResult?.message ?? '';

  useEffect(() => {
    if (!open) return;
    const trigger = triggerRef.current;
    closeButtonRef.current?.focus();

    const handleDialogKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        setOpen(false);
        return;
      }
      if (event.key !== 'Tab') return;

      const focusable = dialogRef.current?.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      const items = Array.from(focusable ?? []).filter((item) => !item.hidden && item.getAttribute('aria-hidden') !== 'true');
      if (items.length === 0) {
        event.preventDefault();
        dialogRef.current?.focus();
        return;
      }
      const first = items[0]!;
      const last = items[items.length - 1]!;
      if (event.shiftKey && (document.activeElement === first || !items.includes(document.activeElement as HTMLElement) || !dialogRef.current?.contains(document.activeElement))) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (document.activeElement === last || !items.includes(document.activeElement as HTMLElement) || !dialogRef.current?.contains(document.activeElement))) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleDialogKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleDialogKeyDown);
      document.body.style.overflow = previousOverflow;
      if (trigger?.isConnected) trigger.focus();
    };
  }, [open]);

  useEffect(() => {
    if (!open || !supportedScramble || invalidScramble) {
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
        experimentalSetupAlg: supportedScramble.notation,
        visualization: '3D',
        background: 'none',
        controlPanel: 'none',
      });
      player.classList.add('timer-page__cube-player');
      player.contentWrapper.style.height = '100%';
      player.setAttribute('aria-label', '3×3 cube state after the displayed scramble');
      player.experimentalModel.userVisibleErrorTracker.addFreshListener(({ errors }) => {
        if (!active || errors.length === 0) return;
        player?.remove();
        host.replaceChildren();
        setResult({ requestKey, status: 'error', message: 'Cube preview could not render. The scramble and timer are still available.' });
      });
      host.replaceChildren(player);
      setResult({ requestKey, status: 'ready' });
    }).catch(() => {
      if (!active) return;
      setResult({ requestKey, status: 'error', message: 'Cube preview could not load. The scramble and timer are still available.' });
    });

    return () => {
      active = false;
      player?.remove();
      host?.replaceChildren();
    };
  }, [invalidScramble, loadViewer, open, requestKey, supportedScramble]);

  return <>
    <button
      aria-haspopup="dialog"
      className="rv-card timer-page__cube-preview-card"
      onClick={() => {
        setResult(null);
        setOpen(true);
      }}
      ref={triggerRef}
      type="button"
    >
      <h3>Cube Preview</h3>
      <MiniatureCubeNet loadCubeNet={loadNet} puzzle={puzzle} scramble={scramble} />
      <p>View in 3D</p>
    </button>

    {open && <div
      className="timer-page__cube-dialog-backdrop"
      onClick={(event) => {
        if (event.target === event.currentTarget) setOpen(false);
      }}
    >
      <section
        aria-labelledby="timer-cube-dialog-title"
        aria-modal="true"
        className="timer-page__cube-dialog"
        ref={dialogRef}
        role="dialog"
        tabIndex={-1}
      >
        <div className="timer-page__cube-dialog-heading">
          <div>
            <h2 id="timer-cube-dialog-title">Cube Preview</h2>
            <p className="timer-page__hint">Interactive 3D preview of the displayed scramble.</p>
          </div>
          <button
            aria-label="Close cube preview"
            className="rv-icon-button"
            onClick={() => setOpen(false)}
            ref={closeButtonRef}
            type="button"
          >
            <span aria-hidden="true">×</span>
          </button>
        </div>
        {puzzle !== '333'
          ? <p className="timer-page__hint" role="status">Cube preview currently supports 3×3 scrambles. Your scramble remains available above.</p>
          : !supportedScramble
            ? <p className="timer-page__hint" role="status">A 3×3 scramble is not available to preview yet.</p>
            : invalidScramble
              ? <p className="timer-page__hint" role="status">{errorMessage}</p>
              : <>
                <p className="rv-visually-hidden" aria-live="polite" role="status">
                  {state === 'loading' ? 'Loading cube preview.' : state === 'ready' ? '3D preview ready for the current scramble.' : ''}
                </p>
                {state === 'error' && <p className="timer-page__hint" role="status">{errorMessage}</p>}
                {state === 'loading' && <p className="timer-page__hint">Loading cube preview…</p>}
                <div
                  aria-busy={state === 'loading'}
                  className={`timer-page__cube-dialog-viewer${state === 'ready' ? ' is-ready' : ''}`}
                  data-scramble-id={supportedScramble.id}
                  ref={viewerHost}
                />
              </>}
      </section>
    </div>}
  </>;
}

function MiniatureCubeNet({ puzzle, scramble, loadCubeNet: loadNet }: {
  puzzle: PuzzleType;
  scramble: Scramble | null;
  loadCubeNet: CubeNetLoader;
}) {
  const host = useRef<HTMLDivElement>(null);
  const [result, setResult] = useState<{ key: string; status: 'ready' | 'error' } | null>(null);
  const requestKey = `${puzzle}:${scramble?.id ?? ''}:${scramble?.puzzle ?? ''}:${scramble?.notation ?? ''}`;
  const supportedScramble = puzzle === '333' && scramble?.puzzle === '333' ? scramble : null;
  const validation = supportedScramble ? validateScramble('333', supportedScramble.notation) : null;
  const invalid = Boolean(validation && validation.status !== 'success');
  const currentStatus = result?.key === requestKey ? result.status : 'loading';

  useEffect(() => {
    if (!supportedScramble || invalid) {
      host.current?.replaceChildren();
      return;
    }
    const currentHost = host.current;
    let active = true;
    currentHost?.replaceChildren();

    void loadNet(supportedScramble.notation).then((svg) => {
      if (!active || !currentHost) return;
      currentHost.replaceChildren(svg);
      setResult({ key: requestKey, status: 'ready' });
    }).catch(() => {
      if (!active) return;
      setResult({ key: requestKey, status: 'error' });
    });

    return () => {
      active = false;
      currentHost?.replaceChildren();
    };
  }, [invalid, loadNet, requestKey, supportedScramble]);

  const message = puzzle !== '333' || (scramble && scramble.puzzle !== '333')
    ? '3×3 only'
    : !scramble
      ? 'Waiting for scramble'
      : invalid || currentStatus === 'error'
        ? 'Preview unavailable'
        : currentStatus === 'loading' ? 'Loading preview…' : '';

  return <div aria-hidden="true" className="timer-page__cube-preview-net" data-scramble-id={supportedScramble?.id ?? undefined}>
    {message && <span className="timer-page__cube-preview-fallback">{message}</span>}
    <div aria-busy={currentStatus === 'loading'} className="timer-page__cube-preview-net-canvas" ref={host} />
  </div>;
}
