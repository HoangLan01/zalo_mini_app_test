import { create } from 'zustand';

export type BookingItem = {
  id: string;
  code: string;
  dateStr: string;
  category: string;
  status: string;
  statusText: string;
  statusColor: string;
};

interface BookingState {
  bookings: BookingItem[];
  addBooking: (booking: BookingItem) => void;
  removeBooking: (id: string) => void;
}

const initialBookings: BookingItem[] = [
  { id: '1', code: 'LH-2026-0015', dateStr: 'Thứ 3, 20/05/2026 – 9:00', category: 'Hộ tịch – Đăng ký khai sinh', status: 'pending', statusText: 'Chờ xác nhận', statusColor: '#FFA500' },
  { id: '2', code: 'LH-2026-0002', dateStr: 'Thứ 2, 05/05/2026 – 14:00', category: 'Đất đai – Xây dựng', status: 'completed', statusText: 'Đã hoàn thành', statusColor: '#888888' },
];

export const useBookingStore = create<BookingState>((set) => ({
  bookings: initialBookings,
  addBooking: (bk) => set((state) => ({ bookings: [bk, ...state.bookings] })),
  removeBooking: (id) => set((state) => ({ bookings: state.bookings.filter(b => b.id !== id) }))
}));
