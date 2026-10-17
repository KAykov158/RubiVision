export type PuzzleType = '222' | '333' | '444' | '555' | '666' | '777';
export type Penalty = 'NONE' | 'PLUS_TWO' | 'DNF';
export type TimingSource = 'KEYBOARD' | 'TOUCH' | 'SMART_CUBE';
export type ActivityLabel = 'MOVEMENT' | 'PAUSE' | 'UNCERTAIN';

export interface Scramble {
  id: string;
  puzzle: PuzzleType;
  notation: string;
  generatorVersion: string;
  createdAt: string;
}

export interface Session {
  id: string;
  name: string;
  puzzle: PuzzleType;
  createdAt: string;
  updatedAt: string;
}

export interface Solve {
  id: string;
  sessionId: string;
  scrambleId: string;
  puzzle: PuzzleType;
  rawTimeMs: number;
  penalty: Penalty;
  startedAt: string;
  completedAt: string;
  timingSource: TimingSource;
  notes?: string;
}

export interface Recording {
  id: string;
  solveId: string;
  createdAt: string;
  durationMs: number;
  mimeType: string;
  width?: number;
  height?: number;
  /** Opaque storage reference; its persistence adapter is defined by the owning feature. */
  blobStorageKey: string;
  /** Timer start relative to recording start, in milliseconds. */
  timerStartOffsetMs: number;
}

export interface ActivitySegment {
  startMs: number;
  endMs: number;
  label: ActivityLabel;
  confidence: number | null;
}

export interface SolveAnalysis {
  id: string;
  solveId: string;
  recordingId: string;
  modelVersion: string;
  featureSchemaVersion: string;
  createdAt: string;
  segments: ActivitySegment[];
  qualityWarnings: string[];
}

export interface FeatureWindow {
  recordingId: string;
  startMs: number;
  endMs: number;
  /** Feature order is fixed by the associated, versioned feature schema. */
  features: number[];
  qualityFlags: string[];
}

export type ServiceUnavailableReason =
  | 'NOT_CONFIGURED'
  | 'AUTH_REQUIRED'
  | 'NETWORK_REQUIRED'
  | 'UNSUPPORTED';

export type ServiceErrorCode =
  | 'INVALID_INPUT'
  | 'NOT_FOUND'
  | 'FORBIDDEN'
  | 'CONFLICT'
  | 'NETWORK'
  | 'RATE_LIMITED'
  | 'CANCELLED'
  | 'UNKNOWN';

export type ServiceResult<T> =
  | { status: 'success'; data: T }
  | {
      status: 'unavailable';
      reason: ServiceUnavailableReason;
      message?: string;
    }
  | {
      status: 'error';
      code: ServiceErrorCode;
      message?: string;
    };

export interface ScrambleService {
  generate(puzzle: PuzzleType): Promise<ServiceResult<Scramble>>;
}

export interface SolveListFilter {
  sessionId?: string;
  puzzle?: PuzzleType;
}

export interface SolveRepository {
  save(solve: Solve): Promise<ServiceResult<void>>;
  get(id: string): Promise<ServiceResult<Solve | null>>;
  list(filter?: SolveListFilter): Promise<ServiceResult<Solve[]>>;
  updatePenalty(
    id: string,
    penalty: Penalty,
  ): Promise<ServiceResult<void>>;
}

export interface AnalysisOptions {
  signal?: AbortSignal;
}

export interface AnalysisService {
  analyze(
    recordingId: string,
    options?: AnalysisOptions,
  ): Promise<ServiceResult<SolveAnalysis>>;
}

export type ThemePreference = 'system' | 'light' | 'dark';

/** User-scoped preference persistence is supplied by the owning cloud adapter. */
export interface UserPreferencesService {
  getThemePreference(): Promise<ServiceResult<unknown>>;
  saveThemePreference(theme: ThemePreference): Promise<ServiceResult<void>>;
}

export interface AppServices {
  scrambles: ScrambleService;
  solves: SolveRepository;
  analysis: AnalysisService;
  preferences?: UserPreferencesService;
}
