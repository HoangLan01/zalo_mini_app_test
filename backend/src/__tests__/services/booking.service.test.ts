/**
 * Unit tests for booking.service.ts
 */
import '../setup';
import { prismaMock, createMockUser, createMockBooking } from '../setup';
import * as bookingService from '../../services/booking.service';
import { AppError } from '../../utils/appError';

describe('createBooking', () => {
  const validBookingInput = {
    field: 'HO_TICH' as const,
    preferredDate: '', // Will be set dynamically
    preferredTime: '09:00',
    description: 'Test booking',
    contactName: 'Nguyen Van A',
    contactPhone: '0901234567',
  };

  beforeEach(() => {
    // Set a future weekday date
    const futureDate = getNextWeekday();
    validBookingInput.preferredDate = futureDate;
  });

  it('should create booking successfully with valid data', async () => {
    prismaMock.booking.count.mockResolvedValue(0);
    const mockBooking = createMockBooking();
    prismaMock.booking.create.mockResolvedValue({
      ...mockBooking,
      user: createMockUser(),
    } as any);

    const result = await bookingService.createBooking('test-user-id', validBookingInput);

    expect(prismaMock.booking.create).toHaveBeenCalled();
    expect(result).toBeDefined();
  });

  it('should throw BOOKING_DATE_IN_PAST for past date', async () => {
    const pastInput = { ...validBookingInput, preferredDate: '2020-01-01' };

    await expect(bookingService.createBooking('test-user-id', pastInput))
      .rejects.toThrow('Không thể đặt lịch trước ngày hiện tại');
  });

  it('should throw BOOKING_DATE_WEEKEND for Saturday', async () => {
    const saturday = getNextSaturday();
    const weekendInput = { ...validBookingInput, preferredDate: saturday };

    await expect(bookingService.createBooking('test-user-id', weekendInput))
      .rejects.toThrow('Không thể đặt lịch vào Thứ 7 hoặc Chủ nhật');
  });

  it('should throw BOOKING_DATE_WEEKEND for Sunday', async () => {
    const sunday = getNextSunday();
    const weekendInput = { ...validBookingInput, preferredDate: sunday };

    await expect(bookingService.createBooking('test-user-id', weekendInput))
      .rejects.toThrow('Không thể đặt lịch vào Thứ 7 hoặc Chủ nhật');
  });
});

describe('cancelBooking', () => {
  it('should cancel a PENDING booking', async () => {
    const mockBooking = createMockBooking({ status: 'PENDING' });
    prismaMock.booking.findFirst.mockResolvedValue(mockBooking);
    prismaMock.booking.update.mockResolvedValue({ ...mockBooking, status: 'CANCELLED' });

    const result = await bookingService.cancelBooking('test-booking-id', 'test-user-id');
    expect(result.status).toBe('CANCELLED');
  });

  it('should cancel a CONFIRMED booking', async () => {
    const mockBooking = createMockBooking({ status: 'CONFIRMED' });
    prismaMock.booking.findFirst.mockResolvedValue(mockBooking);
    prismaMock.booking.update.mockResolvedValue({ ...mockBooking, status: 'CANCELLED' });

    const result = await bookingService.cancelBooking('test-booking-id', 'test-user-id');
    expect(result.status).toBe('CANCELLED');
  });

  it('should throw NOT_FOUND when booking does not exist', async () => {
    prismaMock.booking.findFirst.mockResolvedValue(null);

    await expect(bookingService.cancelBooking('nonexistent', 'test-user-id'))
      .rejects.toThrow('Không tìm thấy lịch hẹn');
  });

  it('should throw BOOKING_CANNOT_CANCEL for COMPLETED booking', async () => {
    const mockBooking = createMockBooking({ status: 'COMPLETED' });
    prismaMock.booking.findFirst.mockResolvedValue(mockBooking);

    await expect(bookingService.cancelBooking('test-booking-id', 'test-user-id'))
      .rejects.toThrow('Lịch hẹn này không thể hủy');
  });
});

describe('updateBookingStatusByAdmin', () => {
  it('should confirm booking with date and time', async () => {
    const mockBooking = createMockBooking();
    prismaMock.booking.findUnique.mockResolvedValue(mockBooking);
    prismaMock.booking.update.mockResolvedValue({
      ...mockBooking,
      status: 'CONFIRMED',
      confirmedDate: new Date('2026-08-01'),
      confirmedTime: '10:00',
      user: createMockUser(),
    } as any);

    const result = await bookingService.updateBookingStatusByAdmin('test-booking-id', {
      status: 'CONFIRMED',
      confirmedDate: '2026-08-01',
      confirmedTime: '10:00',
    });

    expect(result.status).toBe('CONFIRMED');
  });

  it('should throw MISSING_CONFIRMATION when confirming without date', async () => {
    const mockBooking = createMockBooking();
    prismaMock.booking.findUnique.mockResolvedValue(mockBooking);

    await expect(
      bookingService.updateBookingStatusByAdmin('test-booking-id', {
        status: 'CONFIRMED',
      })
    ).rejects.toThrow('Vui lòng cung cấp ngày và giờ xác nhận');
  });

  it('should throw MISSING_REJECTION_REASON when rejecting without reason', async () => {
    const mockBooking = createMockBooking();
    prismaMock.booking.findUnique.mockResolvedValue(mockBooking);

    await expect(
      bookingService.updateBookingStatusByAdmin('test-booking-id', {
        status: 'REJECTED',
      })
    ).rejects.toThrow('Vui lòng nhập lý do từ chối lịch hẹn');
  });

  it('should throw NOT_FOUND when booking does not exist', async () => {
    prismaMock.booking.findUnique.mockResolvedValue(null);

    await expect(
      bookingService.updateBookingStatusByAdmin('nonexistent', {
        status: 'CONFIRMED',
        confirmedDate: '2026-08-01',
        confirmedTime: '10:00',
      })
    ).rejects.toThrow('Không tìm thấy lịch hẹn');
  });
});

describe('getBookingsByUser', () => {
  it('should return paginated bookings', async () => {
    const mockBookings = [createMockBooking(), createMockBooking({ id: 'booking-2', code: 'LH-2026-0002' })];
    prismaMock.booking.findMany.mockResolvedValue(mockBookings);
    prismaMock.booking.count.mockResolvedValue(2);

    const result = await bookingService.getBookingsByUser('test-user-id', 1, 10);

    expect(result.data).toHaveLength(2);
    expect(result.pagination).toEqual({
      page: 1,
      limit: 10,
      total: 2,
      totalPages: 1,
    });
  });

  it('should calculate totalPages correctly', async () => {
    prismaMock.booking.findMany.mockResolvedValue([]);
    prismaMock.booking.count.mockResolvedValue(25);

    const result = await bookingService.getBookingsByUser('test-user-id', 1, 10);

    expect(result.pagination.totalPages).toBe(3);
  });
});

// ── Helpers ──
function getNextWeekday(): string {
  const date = new Date();
  date.setDate(date.getDate() + 7); // 1 week from now
  // Ensure it's a weekday
  while (date.getUTCDay() === 0 || date.getUTCDay() === 6) {
    date.setDate(date.getDate() + 1);
  }
  return date.toISOString().split('T')[0];
}

function getNextSaturday(): string {
  const date = new Date();
  date.setDate(date.getDate() + 7);
  while (date.getUTCDay() !== 6) {
    date.setDate(date.getDate() + 1);
  }
  return date.toISOString().split('T')[0];
}

function getNextSunday(): string {
  const date = new Date();
  date.setDate(date.getDate() + 7);
  while (date.getUTCDay() !== 0) {
    date.setDate(date.getDate() + 1);
  }
  return date.toISOString().split('T')[0];
}
