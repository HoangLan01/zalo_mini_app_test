import { create } from 'zustand';

export type FeedbackItem = {
  id: string;
  code: string;
  title: string;
  status: string;
  statusText: string;
  statusColor: string;
  date: string;
  thumb?: string;
  desc?: string;
  category?: string;
};

interface FeedbackState {
  feedbacks: FeedbackItem[];
  resolvedFeedbacks: FeedbackItem[];
  addFeedback: (fb: FeedbackItem) => void;
}

const initialFeedbacks: FeedbackItem[] = [
  { id: '1', code: 'PA-2026-0042', title: 'Hệ thống đèn đường ngõ 12 bị hỏng', status: 'processing', statusText: 'Đang xử lý', statusColor: '#0068FF', date: '20/04/2026', thumb: 'https://images.unsplash.com/photo-1546422904-90eab23c3d7e?w=160' },
  { id: '2', code: 'PA-2026-0038', title: 'Rác thải đổ trộm tại khu đất trống', status: 'pending', statusText: 'Đang tiếp nhận', statusColor: '#FFA500', date: '18/04/2026' },
];

const initialResolved: FeedbackItem[] = [
  { id: '3', code: 'PA-2026-0012', title: 'Nắp cống bị vỡ tại ngã tư', status: 'resolved', statusText: 'Đã giải quyết', statusColor: '#22C55E', date: '12/04/2026' }
];

export const useFeedbackStore = create<FeedbackState>((set) => ({
  feedbacks: initialFeedbacks,
  resolvedFeedbacks: initialResolved,
  addFeedback: (fb) => set((state) => ({ feedbacks: [fb, ...state.feedbacks] }))
}));
