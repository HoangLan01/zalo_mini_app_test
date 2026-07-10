/**
 * Integration tests for quiz routes
 */
import '../setup';
import { prismaMock, createMockUser, generateTestToken } from '../setup';
import request from 'supertest';
import app from '../../app';

const userToken = generateTestToken({ userId: 'test-user-id', role: 'USER' });

describe('GET /api/quiz/topics', () => {
  beforeEach(() => {
    const mockUser = createMockUser();
    prismaMock.user.findUnique.mockResolvedValue(mockUser);
  });

  it('should return 401 without token', async () => {
    const res = await request(app).get('/api/quiz/topics');

    expect(res.status).toBe(401);
  });

  it('should return list of public topics', async () => {
    const mockTopics = [
      { id: 't1', slug: 'topic-1', title: 'Topic 1', description: null, order: 0, _count: { sets: 2 } },
    ];
    prismaMock.quizTopic.findMany.mockResolvedValue(mockTopics as any);

    const res = await request(app)
      .get('/api/quiz/topics')
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});

describe('GET /api/quiz/sets/:setId', () => {
  beforeEach(() => {
    const mockUser = createMockUser();
    prismaMock.user.findUnique.mockResolvedValue(mockUser);
  });

  it('should return 401 without token', async () => {
    const res = await request(app).get('/api/quiz/sets/set-1');

    expect(res.status).toBe(401);
  });

  it('should return quiz set details', async () => {
    const mockSet = {
      id: 'set-1',
      title: 'Quiz 1',
      description: 'Test quiz',
      timeLimit: 300,
      status: 'PUBLISHED',
      topic: { id: 't1', title: 'Topic 1', slug: 'topic-1' },
      questions: [
        {
          id: 'q1',
          content: 'Test question?',
          type: 'MULTIPLE_CHOICE',
          points: 10,
          order: 0,
          options: [
            { id: 'o1', content: 'Option A', order: 0 },
            { id: 'o2', content: 'Option B', order: 1 },
          ],
        },
      ],
      attempts: [],
      attempt: null,
    };
    prismaMock.quizSet.findFirst.mockResolvedValue({ ...mockSet, attempts: [] } as any);

    const res = await request(app)
      .get('/api/quiz/sets/set-1')
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});

describe('POST /api/quiz/sets/:setId/attempts/start', () => {
  beforeEach(() => {
    const mockUser = createMockUser();
    prismaMock.user.findUnique.mockResolvedValue(mockUser);
  });

  it('should start a new quiz attempt', async () => {
    const mockSet = {
      id: 'set-1',
      status: 'PUBLISHED',
      archivedAt: null,
      questions: [{ points: 10 }, { points: 20 }],
    };
    prismaMock.quizSet.findFirst.mockResolvedValue(mockSet as any);
    prismaMock.quizAttempt.findUnique.mockResolvedValue(null);
    prismaMock.quizAttempt.create.mockResolvedValue({
      id: 'attempt-1',
      userId: 'test-user-id',
      quizSetId: 'set-1',
      score: 0,
      maxScore: 30,
      timeTaken: 0,
      status: 'IN_PROGRESS',
      startedAt: new Date(),
      submittedAt: null,
    } as any);

    const res = await request(app)
      .post('/api/quiz/sets/set-1/attempts/start')
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });
});

describe('GET /api/quiz/sets/:setId/leaderboard', () => {
  beforeEach(() => {
    const mockUser = createMockUser();
    prismaMock.user.findUnique.mockResolvedValue(mockUser);
  });

  it('should return leaderboard', async () => {
    prismaMock.quizAttempt.findMany.mockResolvedValue([]);

    const res = await request(app)
      .get('/api/quiz/sets/set-1/leaderboard')
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
