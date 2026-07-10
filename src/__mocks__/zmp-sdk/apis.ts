/**
 * Mock for zmp-sdk/apis
 * Provides mock implementations for all Zalo Mini App SDK functions
 */
import { vi } from 'vitest';

export const getAccessToken = vi.fn().mockResolvedValue('mock-access-token');

export const getUserInfo = vi.fn().mockResolvedValue({
  userInfo: {
    id: 'mock-zalo-user-id',
    name: 'Mock User',
    avatar: 'https://example.com/avatar.jpg',
  },
});

export const getPhoneNumber = vi.fn().mockResolvedValue({
  token: 'mock-phone-token',
});

export const openWebview = vi.fn();
