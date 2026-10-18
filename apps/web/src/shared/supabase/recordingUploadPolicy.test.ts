import { describe, expect, it } from 'vitest';
import { MAX_RECORDING_UPLOAD_BYTES, validateRecordingUploadSize } from './recordingUploadPolicy';

describe('recording upload size policy', () => {
  it('uses the 50 MiB Free-plan maximum and accepts the exact boundary', () => {
    expect(MAX_RECORDING_UPLOAD_BYTES).toBe(52_428_800);
    expect(validateRecordingUploadSize(MAX_RECORDING_UPLOAD_BYTES)).toEqual({ valid: true });
  });

  it('rejects sizes over the cap and malformed sizes', () => {
    expect(validateRecordingUploadSize(MAX_RECORDING_UPLOAD_BYTES + 1)).toEqual({ valid: false, reason: 'EXCEEDS_MAXIMUM' });
    for (const size of [-1, 1.5, Number.NaN, Number.POSITIVE_INFINITY, Number.MAX_SAFE_INTEGER + 1]) {
      expect(validateRecordingUploadSize(size)).toEqual({ valid: false, reason: 'INVALID_SIZE' });
    }
  });
});
