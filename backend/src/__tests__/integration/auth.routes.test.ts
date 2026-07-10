/**
 * Integration tests for auth routes
 * Uses supertest against the Express app with mocked dependencies.
 */
import '../setup';
import { prismaMock, createMockUser, createMockAdminUser } from '../setup';
import request from 'supertest';
import app from '../../app';

describe('GET /health', () => {
  it('should return 200 with status ok', async () => {
    const res = await request(app).get('/health');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('ok');
    expect(res.body.data.timestamp).toBeDefined();
  });
});

describe('POST /api/auth/dev-login', () => {
  it('should return token in development mode', async () => {
    process.env.NODE_ENV = 'development';
    process.env.ENABLE_DEV_AUTH = 'true';

    const mockUser = createMockUser({ zaloId: 'test-zalo-user' });
    prismaMock.user.upsert.mockResolvedValue(mockUser);

    const res = await request(app).post('/api/auth/dev-login');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
  });

  afterEach(() => {
    process.env.NODE_ENV = 'test';
    process.env.ENABLE_DEV_AUTH = 'true';
  });
});

describe('POST /api/auth/login', () => {
  it('should return 400 for missing accessToken', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('should return 400 for empty accessToken', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ accessToken: '' });

    expect(res.status).toBe(400);
  });
});

describe('GET /api/auth/me', () => {
  it('should return 401 without Authorization header', async () => {
    const res = await request(app).get('/api/auth/me');

    expect(res.status).toBe(401);
  });
});

describe('404 handler', () => {
  it('should return 404 for unknown routes', async () => {
    const res = await request(app).get('/api/nonexistent');

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });
});
