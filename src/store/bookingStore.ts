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
  { id: '3', code: 'LH-2026-0016', dateStr: 'Thứ 4, 21/05/2026 – 10:00', category: 'Cư trú – Đăng ký tạm trú', status: 'pending', statusText: 'Chờ xác nhận', statusColor: '#FFA500' },
  { id: '4', code: 'LH-2026-0017', dateStr: 'Thứ 5, 22/05/2026 – 15:30', category: 'Chứng thực – Sao y bản chính', status: 'confirmed', statusText: 'Đã xác nhận', statusColor: '#10B981' },
  { id: '5', code: 'LH-2026-0018', dateStr: 'Thứ 6, 23/05/2026 – 08:30', category: 'Xã hội – Chế độ chính sách', status: 'pending', statusText: 'Chờ xác nhận', statusColor: '#FFA500' },
  { id: '6', code: 'LH-2026-0019', dateStr: 'Thứ 2, 26/05/2026 – 14:00', category: 'Khác – Tư vấn pháp lý', status: 'pending', statusText: 'Chờ xác nhận', statusColor: '#FFA500' },
  { id: '7', code: 'LH-2026-0020', dateStr: 'Thứ 3, 27/05/2026 – 09:00', category: 'Hộ tịch – Đăng ký kết hôn', status: 'confirmed', statusText: 'Đã xác nhận', statusColor: '#10B981' },
  { id: '8', code: 'LH-2026-0021', dateStr: 'Thứ 4, 28/05/2026 – 15:00', category: 'Đất đai – Cấp sổ đỏ', status: 'pending', statusText: 'Chờ xác nhận', statusColor: '#FFA500' },
];

export const useBookingStore = create<BookingState>((set) => ({
  bookings: initialBookings,
  addBooking: (bk) => set((state) => ({ bookings: [bk, ...state.bookings] })),
  removeBooking: (id) => set((state) => ({ bookings: state.bookings.filter(b => b.id !== id) }))
}));
