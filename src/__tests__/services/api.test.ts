/**
 * Unit tests for api.ts service
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock zaloHelper before importing api
vi.mock('@/utils/zaloHelper', () => ({
  getZaloAccessToken: vi.fn().mockResolvedValue(null),
  logDevError: vi.fn(),
}));

// Setup fetch mock
const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

describe('api service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  describe('apiCall', () => {
    it('should auto-login with dev-login when no Zalo token available', async () => {
      // First call: dev-login returns token
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: { token: 'dev-jwt-token' },
        }),
      });

      // Second call: the actual API call
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: { items: ['test'] },
        }),
      });

      const { apiCall } = await import('@/services/api');
      const result = await apiCall('/api/test');

      expect(result).toEqual({ items: ['test'] });
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });

    it('should retry on 401 response', async () => {
      // Set up initial token
      localStorage.setItem('mini_app_jwt', 'expired-token');

      // First call: returns 401
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({
          success: false,
          error: { code: 'UNAUTHORIZED', message: 'Token expired' },
        }),
      });

      // Second call: dev-login for new token
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: { token: 'new-jwt-token' },
        }),
      });

      // Third call: retry the original request
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: { result: 'ok' },
        }),
      });

      const { apiCall } = await import('@/services/api');
      const result = await apiCall('/api/protected');

      expect(result).toEqual({ result: 'ok' });
    });
  });

  describe('clearApiToken', () => {
    it('should remove JWT from localStorage', async () => {
      localStorage.setItem('mini_app_jwt', 'some-token');

      const { clearApiToken } = await import('@/services/api');
      clearApiToken();

      expect(localStorage.getItem('mini_app_jwt')).toBeNull();
    });
  });

  describe('uploadFeedbackImages', () => {
    it('should return empty array for empty input', async () => {
      const { uploadFeedbackImages } = await import('@/services/api');
      const result = await uploadFeedbackImages([]);

      expect(result).toEqual([]);
    });
  });
});
