/**
 * Unit tests for quizStore
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useQuizStore } from '@/store/quizStore';

// Mock the api module
vi.mock('@/services/api', () => ({
  apiCall: vi.fn(),
}));

import { apiCall } from '@/services/api';

describe('useQuizStore', () => {
  beforeEach(() => {
    useQuizStore.setState({
      topics: [],
      sets: [],
      currentSet: null,
      currentAttempt: null,
      result: null,
      leaderboard: [],
      isLoading: false,
      error: null,
    });
    vi.clearAllMocks();
  });

  it('should have correct initial state', () => {
    const state = useQuizStore.getState();
    expect(state.topics).toEqual([]);
    expect(state.sets).toEqual([]);
    expect(state.currentSet).toBeNull();
    expect(state.currentAttempt).toBeNull();
    expect(state.result).toBeNull();
    expect(state.leaderboard).toEqual([]);
    expect(state.isLoading).toBe(false);
    expect(state.error).toBeNull();
  });

  describe('fetchTopics', () => {
    it('should fetch topics successfully', async () => {
      const mockTopics = [{ id: 't1', slug: 'topic-1', title: 'Topic 1', order: 1 }];
      vi.mocked(apiCall).mockResolvedValueOnce(mockTopics);

      await useQuizStore.getState().fetchTopics();

      const state = useQuizStore.getState();
      expect(state.topics).toEqual(mockTopics);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
      expect(apiCall).toHaveBeenCalledWith('/api/quiz/topics');
    });

    it('should handle fetch errors', async () => {
      vi.mocked(apiCall).mockRejectedValueOnce(new Error('Network error'));

      await useQuizStore.getState().fetchTopics();

      const state = useQuizStore.getState();
      expect(state.error).toBe('Network error');
      expect(state.isLoading).toBe(false);
    });
  });

  describe('fetchSetsByTopic', () => {
    it('should fetch sets by topic', async () => {
      const mockSets = [{ id: 's1', topicId: 't1', title: 'Set 1', timeLimit: 300, status: 'PUBLISHED', version: 1, order: 1 }];
      vi.mocked(apiCall).mockResolvedValueOnce(mockSets);

      await useQuizStore.getState().fetchSetsByTopic('t1');

      const state = useQuizStore.getState();
      expect(state.sets).toEqual(mockSets);
      expect(apiCall).toHaveBeenCalledWith('/api/quiz/topics/t1/sets');
    });
  });

  describe('fetchSet', () => {
    it('should fetch set and current attempt', async () => {
      const mockSet = {
        id: 's1',
        topicId: 't1',
        title: 'Set 1',
        timeLimit: 300,
        status: 'PUBLISHED' as const,
        version: 1,
        order: 1,
        attempt: { id: 'a1', status: 'IN_PROGRESS' as const, score: 0, maxScore: 10, timeTaken: 0 }
      };
      vi.mocked(apiCall).mockResolvedValueOnce(mockSet);

      const result = await useQuizStore.getState().fetchSet('s1');

      const state = useQuizStore.getState();
      expect(result).toEqual(mockSet);
      expect(state.currentSet).toEqual(mockSet);
      expect(state.currentAttempt).toEqual(mockSet.attempt);
    });
  });

  describe('startAttempt', () => {
    it('should start attempt', async () => {
      const mockAttempt = { id: 'a1', status: 'IN_PROGRESS' as const, score: 0, maxScore: 10, timeTaken: 0 };
      vi.mocked(apiCall).mockResolvedValueOnce(mockAttempt);

      const result = await useQuizStore.getState().startAttempt('s1');

      const state = useQuizStore.getState();
      expect(result).toEqual(mockAttempt);
      expect(state.currentAttempt).toEqual(mockAttempt);
      expect(apiCall).toHaveBeenCalledWith('/api/quiz/sets/s1/attempts/start', { method: 'POST' });
    });
  });

  describe('submitAttempt', () => {
    it('should submit attempt', async () => {
      const mockAttempt = { id: 'a1', status: 'SUBMITTED' as const, score: 10, maxScore: 10, timeTaken: 60 };
      vi.mocked(apiCall).mockResolvedValueOnce(mockAttempt);

      const payload = { timeTaken: 60, answers: [{ questionId: 'q1', selectedOptionId: 'o1' }] };
      const result = await useQuizStore.getState().submitAttempt('a1', payload);

      const state = useQuizStore.getState();
      expect(result).toEqual(mockAttempt);
      expect(state.currentAttempt).toEqual(mockAttempt);
      expect(apiCall).toHaveBeenCalledWith('/api/quiz/attempts/a1/submit', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
    });
  });

  describe('fetchResult', () => {
    it('should fetch attempt result', async () => {
      const mockResult = {
        id: 'a1',
        status: 'SUBMITTED' as const,
        score: 10,
        maxScore: 10,
        timeTaken: 60,
        quizSet: { id: 's1', title: 'Set 1', timeLimit: 300, topic: { id: 't1', title: 'Topic 1' } },
        answers: []
      };
      vi.mocked(apiCall).mockResolvedValueOnce(mockResult);

      await useQuizStore.getState().fetchResult('s1');

      const state = useQuizStore.getState();
      expect(state.result).toEqual(mockResult);
    });
  });

  describe('fetchLeaderboard', () => {
    it('should fetch leaderboard', async () => {
      const mockLeaderboard = [
        { id: 'a1', score: 10, maxScore: 10, timeTaken: 60, submittedAt: '2026-08-01', user: { id: 'u1', displayName: 'User 1' } }
      ];
      vi.mocked(apiCall).mockResolvedValueOnce(mockLeaderboard);

      await useQuizStore.getState().fetchLeaderboard('s1');

      const state = useQuizStore.getState();
      expect(state.leaderboard).toEqual(mockLeaderboard);
    });
  });
});
