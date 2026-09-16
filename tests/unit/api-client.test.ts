import { afterEach, describe, expect, it, vi } from 'vitest';
import { requestJson } from '../../src/services/apiClient';
import { searchCities } from '../../src/services/geocodingService';

afterEach(() => {
  vi.restoreAllMocks();
});

describe('api client', () => {
  it('classifies timeout and network errors as ApiError with retry metadata', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockImplementation(async () => {
        throw new DOMException('The operation was aborted', 'AbortError');
      }),
    );

    await expect(requestJson('https://example.com', { timeoutMs: 50 })).rejects.toMatchObject({
      type: 'timeout',
      recoverable: true,
      canRetry: true,
    });
  });

  it('maps geocoding failures to ApiError and preserves retry flags', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 429,
        statusText: 'Too Many Requests',
      }),
    );

    await expect(searchCities('são paulo')).rejects.toMatchObject({
      type: 'rate-limit',
      recoverable: true,
      canRetry: true,
    });
  });
});
