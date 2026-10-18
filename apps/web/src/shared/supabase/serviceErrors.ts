import type { ServiceErrorCode, ServiceResult, ServiceUnavailableReason } from '../domain/contracts';

export function mapSupabaseError(error: { code?: string; status?: number; message?: string }): ServiceErrorCode {
  if (error.status === 429 || error.code === '429') return 'RATE_LIMITED';
  if (error.status === 401 || error.status === 403 || error.code === '42501') return 'FORBIDDEN';
  if (error.code === '23505' || error.code === '23503' || error.code === '23514') return 'CONFLICT';
  if (error.code === 'PGRST116') return 'NOT_FOUND';
  if (error.code === 'FETCH_ERROR' || error.message?.toLowerCase().includes('network')) return 'NETWORK';
  return 'UNKNOWN';
}

export function serviceFailure<T>(error: { code?: string; status?: number; message?: string }): ServiceResult<T> {
  const code = mapSupabaseError(error);
  return { status: 'error', code, message: safeMessage(code) };
}

export function unavailable<T>(reason: ServiceUnavailableReason): ServiceResult<T> {
  return { status: 'unavailable', reason };
}

function safeMessage(code: ServiceErrorCode) {
  switch (code) {
    case 'FORBIDDEN': return 'This account is not allowed to perform that action.';
    case 'RATE_LIMITED': return 'Too many requests. Wait a moment and try again.';
    case 'NETWORK': return 'The cloud service could not be reached. Check your connection and retry.';
    case 'CONFLICT': return 'The record conflicts with existing data or violates a data rule.';
    case 'NOT_FOUND': return 'The requested record was not found.';
    case 'INVALID_INPUT': return 'The supplied data is invalid.';
    case 'CANCELLED': return 'The request was cancelled.';
    case 'UNKNOWN': return 'The cloud request failed. Please retry.';
  }
}
