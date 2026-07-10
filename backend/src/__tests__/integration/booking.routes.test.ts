/**
 * Integration tests for booking routes
 */
import '../setup';
import { prismaMock, createMockUser, createMockBooking, generateTestToken } from '../setup';
import request from 'supertest';
import app from '../../app';

const userToken = generateTestToken({ userId: 'test-user-id', role: 'USER' });

describe('POST /api/bookings', () => {
  beforeEach(() => {
    const mockUser = createMockUser();
    prismaMock.user.findUnique.mockResolvedValue(mockUser);
  });

  it('should return 401 without token', async () => {
    const res = await request(app)
      .post('/api/bookings')
      .send({});

    expect(res.status).toBe(401);
  });

  it('should return 400 for invalid booking data', async () => {
    const res = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        field: 'INVALID_FIELD',
        preferredDate: 'not-a-date',
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('should return 400 for past date booking', async () => {
    prismaMock.booking.count.mockResolvedValue(0);

    const res = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        field: 'HO_TICH',
        preferredDate: '2020-01-01',
        preferredTime: '09:00',
        description: 'Test booking description at least ten chars',
        contactName: 'Nguyen Van A',
        contactPhone: '0901234567',
      });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('BOOKING_DATE_IN_PAST');
  });
});

describe('GET /api/bookings/me', () => {
  beforeEach(() => {
    const mockUser = createMockUser();
    prismaMock.user.findUnique.mockResolvedValue(mockUser);
  });

  it('should return 401 without token', async () => {
    const res = await request(app).get('/api/bookings/me');

    expect(res.status).toBe(401);
  });

  it('should return paginated bookings for authenticated user', async () => {
    const mockBookings = [createMockBooking()];
    prismaMock.booking.findMany.mockResolvedValue(mockBookings);
    prismaMock.booking.count.mockResolvedValue(1);

    const res = await request(app)
      .get('/api/bookings/me')
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});

describe('DELETE /api/bookings/:id', () => {
  beforeEach(() => {
    const mockUser = createMockUser();
    prismaMock.user.findUnique.mockResolvedValue(mockUser);
  });

  it('should return 401 without token', async () => {
    const res = await request(app).delete('/api/bookings/00000000-0000-0000-0000-000000000001');

    expect(res.status).toBe(401);
  });

  it('should return 400 for invalid UUID', async () => {
    const res = await request(app)
      .delete('/api/bookings/not-a-uuid')
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(400);
  });

  it('should cancel PENDING booking', async () => {
    const validUuid = '00000000-0000-0000-0000-000000000001';
    const mockBooking = createMockBooking({ id: validUuid, status: 'PENDING' });
    prismaMock.booking.findFirst.mockResolvedValue(mockBooking);
    prismaMock.booking.update.mockResolvedValue({ ...mockBooking, status: 'CANCELLED' });

    const res = await request(app)
      .delete(`/api/bookings/${validUuid}`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
