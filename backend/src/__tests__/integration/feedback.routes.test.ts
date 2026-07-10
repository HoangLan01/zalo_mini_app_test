/**
 * Integration tests for feedback routes
 */
import '../setup';
import { prismaMock, createMockUser, createMockFeedback, generateTestToken } from '../setup';
import request from 'supertest';
import app from '../../app';

const userToken = generateTestToken({ userId: 'test-user-id', role: 'USER' });

describe('POST /api/feedbacks', () => {
  beforeEach(() => {
    const mockUser = createMockUser();
    prismaMock.user.findUnique.mockResolvedValue(mockUser);
  });

  it('should return 401 without token', async () => {
    const res = await request(app)
      .post('/api/feedbacks')
      .send({});

    expect(res.status).toBe(401);
  });

  it('should return 400 for missing required fields (FIELD type)', async () => {
    const res = await request(app)
      .post('/api/feedbacks')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        type: 'FIELD',
        // Missing title, category, description, contactPhone
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('should create FIELD feedback with valid data', async () => {
    prismaMock.feedback.count.mockResolvedValue(0);
    const mockFeedback = createMockFeedback();
    prismaMock.feedback.create.mockResolvedValue({
      ...mockFeedback,
      user: createMockUser(),
    } as any);

    const res = await request(app)
      .post('/api/feedbacks')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        type: 'FIELD',
        title: 'Đường hư hỏng nặng cần sửa',
        category: 'HA_TANG',
        contactPhone: '0901234567',
        description: 'Đường phố bị nứt vỡ nghiêm trọng cần được sửa chữa gấp',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('should create SERVICE_ATTITUDE feedback with valid data', async () => {
    prismaMock.feedback.count.mockResolvedValue(0);
    const mockFeedback = createMockFeedback({ type: 'SERVICE_ATTITUDE' });
    prismaMock.feedback.create.mockResolvedValue({
      ...mockFeedback,
      user: createMockUser(),
    } as any);

    const res = await request(app)
      .post('/api/feedbacks')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        type: 'SERVICE_ATTITUDE',
        serviceUnit: 'Bộ phận Hộ tịch',
        satisfactionScore: 2,
        contactPhone: '0901234567',
        description: 'Thái độ phục vụ không tốt',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });
});

describe('GET /api/feedbacks/me', () => {
  beforeEach(() => {
    const mockUser = createMockUser();
    prismaMock.user.findUnique.mockResolvedValue(mockUser);
  });

  it('should return 401 without token', async () => {
    const res = await request(app).get('/api/feedbacks/me');

    expect(res.status).toBe(401);
  });

  it('should return paginated feedbacks for authenticated user', async () => {
    const mockFeedbacks = [createMockFeedback()];
    prismaMock.feedback.findMany.mockResolvedValue(mockFeedbacks);
    prismaMock.feedback.count.mockResolvedValue(1);

    const res = await request(app)
      .get('/api/feedbacks/me')
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});

describe('GET /api/feedbacks/:id', () => {
  beforeEach(() => {
    const mockUser = createMockUser();
    prismaMock.user.findUnique.mockResolvedValue(mockUser);
  });

  it('should return 400 for invalid UUID', async () => {
    const res = await request(app)
      .get('/api/feedbacks/not-a-uuid')
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(400);
  });

  it('should return feedback by ID for correct user', async () => {
    const validUuid = '00000000-0000-0000-0000-000000000001';
    const mockFeedback = createMockFeedback({ id: validUuid });
    prismaMock.feedback.findFirst.mockResolvedValue(mockFeedback);

    const res = await request(app)
      .get(`/api/feedbacks/${validUuid}`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
