/** 50 MiB per-object upload cap; Supabase Storage remains the authoritative server-side limit. */
export const MAX_RECORDING_UPLOAD_BYTES = 52_428_800;

export type RecordingUploadSizeResult =
  | { valid: true }
  | { valid: false; reason: 'INVALID_SIZE' | 'EXCEEDS_MAXIMUM' };

/** Validate a File/Blob size before any future explicit, consented Storage upload. */
export function validateRecordingUploadSize(sizeBytes: number): RecordingUploadSizeResult {
  if (!Number.isSafeInteger(sizeBytes) || sizeBytes < 0) {
    return { valid: false, reason: 'INVALID_SIZE' };
  }
  if (sizeBytes > MAX_RECORDING_UPLOAD_BYTES) {
    return { valid: false, reason: 'EXCEEDS_MAXIMUM' };
  }
  return { valid: true };
}
