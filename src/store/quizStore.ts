import { create } from 'zustand';
import { apiCall } from '@/services/api';

export type QuestionType = 'MULTIPLE_CHOICE' | 'TRUE_FALSE';
export type QuizSetStatus = 'DRAFT' | 'PUBLISHED' | 'CLOSED' | 'ARCHIVED';
export type AttemptStatus = 'IN_PROGRESS' | 'SUBMITTED' | 'EXPIRED';

export interface QuizTopic {
  id: string;
  slug: string;
  title: string;
  description?: string;
  order: number;
  _count?: { sets: number };
}

export interface QuizOption {
  id: string;
  content: string;
  order: number;
}

export interface Question {
  id: string;
  content: string;
  type: QuestionType;
  points: number;
  order: number;
  options: QuizOption[];
}

export interface QuizAttemptSummary {
  id: string;
  status: AttemptStatus;
  score: number;
  maxScore: number;
  timeTaken: number;
  submittedAt?: string;
}

export interface QuizSet {
  id: string;
  topicId: string;
  title: string;
  description?: string;
  timeLimit: number;
  status: QuizSetStatus;
  version: number;
  order: number;
  questionCount?: number;
  attempt?: QuizAttemptSummary | null;
  questions?: Question[];
}

export interface QuizAttemptResult extends QuizAttemptSummary {
  quizSet: { id: string; title: string; timeLimit: number; topic: { id: string; title: string } };
  answers: Array<{
    id: string;
    questionId: string;
    selectedOptionId?: string;
    isCorrect: boolean;
    pointsAwarded: number;
    questionContent: string;
    selectedOptionContent?: string;
    correctOptionContent?: string;
  }>;
}

export interface LeaderboardItem {
  id: string;
  score: number;
  maxScore: number;
  timeTaken: number;
  submittedAt: string;
  user: { id: string; displayName: string; avatarUrl?: string };
}

interface QuizState {
  topics: QuizTopic[];
  sets: QuizSet[];
  currentSet: QuizSet | null;
  currentAttempt: QuizAttemptSummary | null;
  result: QuizAttemptResult | null;
  leaderboard: LeaderboardItem[];
  isLoading: boolean;
  error: string | null;
  fetchTopics: () => Promise<void>;
  fetchSetsByTopic: (topicId: string) => Promise<void>;
  fetchSet: (setId: string) => Promise<QuizSet>;
  startAttempt: (setId: string) => Promise<QuizAttemptSummary>;
  submitAttempt: (attemptId: string, payload: { timeTaken: number; expired?: boolean; answers: { questionId: string; selectedOptionId?: string | null }[] }) => Promise<QuizAttemptSummary>;
  fetchResult: (setId: string) => Promise<void>;
  fetchLeaderboard: (setId: string) => Promise<void>;
  clearError: () => void;
}

export const useQuizStore = create<QuizState>((set) => ({
  topics: [],
  sets: [],
  currentSet: null,
  currentAttempt: null,
  result: null,
  leaderboard: [],
  isLoading: false,
  error: null,

  fetchTopics: async () => {
    set({ isLoading: true, error: null });
    try {
      const topics = await apiCall<QuizTopic[]>('/api/quiz/topics');
      set({ topics, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  fetchSetsByTopic: async (topicId) => {
    set({ isLoading: true, error: null, sets: [] });
    try {
      const sets = await apiCall<QuizSet[]>(`/api/quiz/topics/${topicId}/sets`);
      set({ sets, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  fetchSet: async (setId) => {
    set({ isLoading: true, error: null });
    try {
      const currentSet = await apiCall<QuizSet>(`/api/quiz/sets/${setId}`);
      set({ currentSet, currentAttempt: currentSet.attempt || null, isLoading: false });
      return currentSet;
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  startAttempt: async (setId) => {
    const attempt = await apiCall<QuizAttemptSummary>(`/api/quiz/sets/${setId}/attempts/start`, { method: 'POST' });
    set({ currentAttempt: attempt });
    return attempt;
  },

  submitAttempt: async (attemptId, payload) => {
    const attempt = await apiCall<QuizAttemptSummary>(`/api/quiz/attempts/${attemptId}/submit`, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    set({ currentAttempt: attempt });
    return attempt;
  },

  fetchResult: async (setId) => {
    set({ isLoading: true, error: null });
    try {
      const result = await apiCall<QuizAttemptResult>(`/api/quiz/sets/${setId}/result`);
      set({ result, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  fetchLeaderboard: async (setId) => {
    try {
      const leaderboard = await apiCall<LeaderboardItem[]>(`/api/quiz/sets/${setId}/leaderboard`);
      set({ leaderboard });
    } catch (error: any) {
      set({ error: error.message });
    }
  },

  clearError: () => set({ error: null })
}));
