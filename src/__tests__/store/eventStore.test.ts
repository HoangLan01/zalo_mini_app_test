/**
 * Unit tests for eventStore
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useEventStore, eventCategoryLabel } from '@/store/eventStore';

// Mock the api module
vi.mock('@/services/api', () => ({
  apiCall: vi.fn(),
}));

import { apiCall } from '@/services/api';

describe('eventCategoryLabel', () => {
  it('should return correct Vietnamese labels', () => {
    expect(eventCategoryLabel('VAN_HOA')).toBe('Văn hóa');
    expect(eventCategoryLabel('THE_THAO')).toBe('Thể thao');
    expect(eventCategoryLabel('HANH_CHINH')).toBe('Hành chính');
    expect(eventCategoryLabel('LE_HOI')).toBe('Lễ hội');
    expect(eventCategoryLabel('KHAC')).toBe('Khác');
  });
});

describe('useEventStore', () => {
  beforeEach(() => {
    useEventStore.setState({
      events: [],
      currentEvent: null,
      isLoading: false,
      error: null,
    });
    vi.clearAllMocks();
  });

  it('should have correct initial state', () => {
    const state = useEventStore.getState();

    expect(state.events).toEqual([]);
    expect(state.currentEvent).toBeNull();
    expect(state.isLoading).toBe(false);
    expect(state.error).toBeNull();
  });

  it('should fetch events successfully', async () => {
    const mockEvents = {
      items: [
        {
          id: 'e1',
          title: 'Test Event',
          description: 'Test description',
          thumbnailUrl: 'https://example.com/thumb.jpg',
          imageUrls: [],
          category: 'VAN_HOA',
          location: 'Hà Nội',
          startAt: '2026-08-01',
          endAt: '2026-08-02',
          organizer: 'Test Organizer',
          status: 'upcoming',
        },
      ],
      pagination: { page: 1, limit: 50, total: 1, totalPages: 1 },
    };

    vi.mocked(apiCall).mockResolvedValueOnce(mockEvents);

    await useEventStore.getState().fetchEvents();

    const state = useEventStore.getState();
    expect(state.events).toHaveLength(1);
    expect(state.events[0].title).toBe('Test Event');
    expect(state.isLoading).toBe(false);
    expect(state.error).toBeNull();
  });

  it('should handle fetch events error', async () => {
    vi.mocked(apiCall).mockRejectedValueOnce(new Error('Network error'));

    await useEventStore.getState().fetchEvents();

    const state = useEventStore.getState();
    expect(state.error).toBe('Network error');
    expect(state.isLoading).toBe(false);
  });

  it('should fetch single event by ID', async () => {
    const mockEvent = {
      id: 'e1',
      title: 'Test Event',
      description: 'Test description',
      thumbnailUrl: 'https://example.com/thumb.jpg',
      imageUrls: [],
      category: 'VAN_HOA',
      location: 'Hà Nội',
      startAt: '2026-08-01',
      endAt: '2026-08-02',
      organizer: 'Test Organizer',
      status: 'upcoming',
    };

    vi.mocked(apiCall).mockResolvedValueOnce(mockEvent);

    const result = await useEventStore.getState().fetchEvent('e1');

    expect(result.title).toBe('Test Event');
    const state = useEventStore.getState();
    expect(state.currentEvent).toEqual(mockEvent);
    expect(state.isLoading).toBe(false);
  });

  it('should handle fetch event error', async () => {
    vi.mocked(apiCall).mockRejectedValueOnce(new Error('Not found'));

    await expect(useEventStore.getState().fetchEvent('nonexistent')).rejects.toThrow('Not found');

    const state = useEventStore.getState();
    expect(state.error).toBe('Not found');
  });

  it('should clear error', () => {
    useEventStore.setState({ error: 'some error' });

    useEventStore.getState().clearError();

    expect(useEventStore.getState().error).toBeNull();
  });

  it('should pass status filter to API', async () => {
    vi.mocked(apiCall).mockResolvedValueOnce({ items: [], pagination: { page: 1, limit: 50, total: 0, totalPages: 0 } });

    await useEventStore.getState().fetchEvents('ongoing');

    expect(apiCall).toHaveBeenCalledWith('/api/events?status=ongoing&page=1&limit=50');
  });
});
