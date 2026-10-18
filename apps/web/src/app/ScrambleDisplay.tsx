import type { Scramble } from '../shared/domain/contracts';

interface ScrambleDisplayProps {
  scramble: Scramble | null;
  unavailableMessage: string;
}

/** Displays notation supplied by the scramble service, or an honest unavailable state. */
export function ScrambleDisplay({ scramble, unavailableMessage }: ScrambleDisplayProps) {
  if (!scramble) {
    return <p aria-live="polite" className="timer-page__scramble-empty" role="status">{unavailableMessage}</p>;
  }

  return <p className="timer-page__scramble-notation">{scramble.notation}</p>;
}
