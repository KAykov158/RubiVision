import { vi } from 'vitest';
import type {
  AnalysisService,
  AppServices,
  Scramble,
  ScrambleService,
  ServiceResult,
  Solve,
  SolveRepository,
  SolveAnalysis,
} from '../../shared/domain/contracts';

export type IntegrationServiceOverrides = {
  scrambles?: Partial<ScrambleService>;
  solves?: Partial<SolveRepository>;
  analysis?: Partial<AnalysisService>;
};

const notConfigured = <T>(): ServiceResult<T> => ({
  status: 'unavailable',
  reason: 'NOT_CONFIGURED',
});

const unavailableScramble: ScrambleService['generate'] = async () => notConfigured<Scramble>();
const unavailableSolveSave: SolveRepository['save'] = async () => notConfigured<void>();
const unavailableSolveGet: SolveRepository['get'] = async () => notConfigured<Solve | null>();
const unavailableSolveList: SolveRepository['list'] = async () => notConfigured<Solve[]>();
const unavailablePenaltyUpdate: SolveRepository['updatePenalty'] = async () => notConfigured<void>();
const unavailableAnalysis: AnalysisService['analyze'] = async () => notConfigured<SolveAnalysis>();

/**
 * Minimal, test-only service doubles. Defaults return the same explicit unavailable result
 * as an unconfigured production boundary; success data must be supplied by an individual test.
 */
export function createIntegrationServiceMocks(
  overrides: IntegrationServiceOverrides = {},
): AppServices {
  return {
    scrambles: {
      generate: vi.fn(overrides.scrambles?.generate ?? unavailableScramble),
    },
    solves: {
      save: vi.fn(overrides.solves?.save ?? unavailableSolveSave),
      get: vi.fn(overrides.solves?.get ?? unavailableSolveGet),
      list: vi.fn(overrides.solves?.list ?? unavailableSolveList),
      updatePenalty: vi.fn(overrides.solves?.updatePenalty ?? unavailablePenaltyUpdate),
    },
    analysis: {
      analyze: vi.fn(overrides.analysis?.analyze ?? unavailableAnalysis),
    },
  };
}
