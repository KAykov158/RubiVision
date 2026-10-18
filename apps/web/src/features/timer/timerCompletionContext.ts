import { createContext, useContext } from 'react';
import type { Penalty, PuzzleType, Scramble, TimingSource } from '../../shared/domain/contracts';

export interface TimerCompletion {
  solveId: string;
  completionOwnerId?: string;
  puzzle: PuzzleType;
  scramble: Scramble | null;
  selectedSessionId?: string;
  rawTimeMs: number;
  penalty: Penalty;
  startedAt: string;
  completedAt: string;
  timingSource: TimingSource;
}

export interface PendingTimerSave {
  completion: TimerCompletion;
  status: 'saving' | 'unsaved' | 'saved';
  message: string;
  completionOwnerId?: string;
}

export interface ActiveTimerRun {
  startedAt: string;
  startedMono: number;
  completionOwnerId?: string;
  puzzle: PuzzleType;
  scramble: Scramble | null;
  selectedSessionId?: string;
  solveId: string;
  timingSource: TimingSource;
}

export interface TimerCompletionContextValue {
  pending: PendingTimerSave | null;
  activeRun: ActiveTimerRun | null;
  elapsedMs: number;
  complete(completion: TimerCompletion): void;
  startTimer(puzzle: PuzzleType, scramble: Scramble | null, selectedSessionId: string | undefined, timingSource: TimingSource): void;
  stopTimer(): void;
  retry(): void;
}

export const TimerCompletionContext = createContext<TimerCompletionContextValue | null>(null);

export function useTimerCompletion() {
  const value = useContext(TimerCompletionContext);
  if (!value) throw new Error('useTimerCompletion must be used within TimerCompletionProvider.');
  return value;
}
