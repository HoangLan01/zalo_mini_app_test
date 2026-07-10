/**
 * Unit tests for userStore
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useUserStore } from '@/store/userStore';
import { getUserInfo } from 'zmp-sdk/apis';

describe('useUserStore', () => {
  beforeEach(() => {
    // Reset store state
    useUserStore.setState({ userInfo: null, isLoading: false });
  });

  it('should have correct initial state', () => {
    const state = useUserStore.getState();

    expect(state.userInfo).toBeNull();
    expect(state.isLoading).toBe(false);
  });

  it('should fetch user info from Zalo SDK', async () => {
    const { fetchUser } = useUserStore.getState();

    await fetchUser();

    const state = useUserStore.getState();
    expect(state.userInfo).toEqual({
      id: 'mock-zalo-user-id',
      name: 'Mock User',
      avatar: 'https://example.com/avatar.jpg',
    });
    expect(state.isLoading).toBe(false);
  });

  it('should set isLoading during fetch', async () => {
    // Verify isLoading is set to true during fetch
    const loadingStates: boolean[] = [];

    const unsubscribe = useUserStore.subscribe((state) => {
      loadingStates.push(state.isLoading);
    });

    await useUserStore.getState().fetchUser();
    unsubscribe();

    // Should have gone: true (start fetch) → false (end fetch)
    expect(loadingStates).toContain(true);
    expect(loadingStates[loadingStates.length - 1]).toBe(false);
  });

  it('should handle null user info from SDK', async () => {
    vi.mocked(getUserInfo).mockResolvedValueOnce({ userInfo: null } as any);

    await useUserStore.getState().fetchUser();

    const state = useUserStore.getState();
    expect(state.userInfo).toBeNull();
    expect(state.isLoading).toBe(false);
  });
});
