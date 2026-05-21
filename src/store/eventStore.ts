import { create } from 'zustand';
import { apiCall } from '@/services/api';

export type PublicEventStatus = 'upcoming' | 'ongoing' | 'past';
export type EventCategory = 'VAN_HOA' | 'THE_THAO' | 'HANH_CHINH' | 'LE_HOI' | 'KHAC';

export interface EventItem {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  imageUrls: string[];
  category: EventCategory;
  location: string;
  startAt: string;
  endAt: string;
  organizer: string;
  contactInfo?: string | null;
  status: PublicEventStatus;
}

type EventListResponse = {
  items: EventItem[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
};

interface EventState {
  events: EventItem[];
  currentEvent: EventItem | null;
  isLoading: boolean;
  error: string | null;
  fetchEvents: (status?: PublicEventStatus) => Promise<void>;
  fetchEvent: (id: string) => Promise<EventItem>;
  clearError: () => void;
}

export const eventCategoryLabel = (category: EventCategory) => {
  const labels: Record<EventCategory, string> = {
    VAN_HOA: 'Van hoa',
    THE_THAO: 'The thao',
    HANH_CHINH: 'Hanh chinh',
    LE_HOI: 'Le hoi',
    KHAC: 'Khac'
  };
  return labels[category] || category;
};

export const useEventStore = create<EventState>((set) => ({
  events: [],
  currentEvent: null,
  isLoading: false,
  error: null,

  fetchEvents: async (status = 'upcoming') => {
    set({ isLoading: true, error: null });
    try {
      const data = await apiCall<EventListResponse>(`/api/events?status=${status}&page=1&limit=50`);
      set({ events: data.items, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  fetchEvent: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const event = await apiCall<EventItem>(`/api/events/${id}`);
      set({ currentEvent: event, isLoading: false });
      return event;
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  clearError: () => set({ error: null })
}));
