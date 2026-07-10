/**
 * Unit tests for quiz.service.ts
 */
import '../setup';
import { prismaMock } from '../setup';
import * as quizService from '../../services/quiz.service';

describe('slugify', () => {
  it('should convert Vietnamese text to slug', () => {
    expect(quizService.slugify('Lịch sử Việt Nam')).toBe('lich-su-viet-nam');
  });

  it('should handle special characters', () => {
    expect(quizService.slugify('Pháp luật & Đời sống!')).toBe('phap-luat-oi-song');
  });

  it('should remove leading/trailing dashes', () => {
    expect(quizService.slugify('  --Hello World--  ')).toBe('hello-world');
  });

  it('should truncate to 120 chars', () => {
    const longString = 'a'.repeat(200);
    expect(quizService.slugify(longString).length).toBeLessThanOrEqual(120);
  });

  it('should handle empty string', () => {
    expect(quizService.slugify('')).toBe('');
  });
});

describe('getPublicTopics', () => {
  it('should return active topics with published sets', async () => {
    const mockTopics = [
      { id: 't1', slug: 'topic-1', title: 'Topic 1', description: null, order: 0, _count: { sets: 2 } },
    ];
    prismaMock.quizTopic.findMany.mockResolvedValue(mockTopics as any);

    const result = await quizService.getPublicTopics();

    expect(result).toHaveLength(1);
    expect(prismaMock.quizTopic.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ archivedAt: null, isActive: true }),
      })
    );
  });
});

describe('startAttempt', () => {
  it('should create new attempt for published set', async () => {
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
      userId: 'user-1',
      quizSetId: 'set-1',
      score: 0,
      maxScore: 30,
      timeTaken: 0,
      status: 'IN_PROGRESS',
      startedAt: new Date(),
      submittedAt: null,
    } as any);

    const result = await quizService.startAttempt('set-1', 'user-1');

    expect(result.maxScore).toBe(30);
    expect(result.status).toBe('IN_PROGRESS');
  });

  it('should throw QUIZ_NOT_OPEN for non-published set', async () => {
    prismaMock.quizSet.findFirst.mockResolvedValue(null);

    await expect(quizService.startAttempt('set-1', 'user-1'))
      .rejects.toThrow('QUIZ_NOT_OPEN');
  });

  it('should throw ATTEMPT_ALREADY_SUBMITTED for submitted attempt', async () => {
    const mockSet = { id: 'set-1', status: 'PUBLISHED', archivedAt: null, questions: [] };
    prismaMock.quizSet.findFirst.mockResolvedValue(mockSet as any);
    prismaMock.quizAttempt.findUnique.mockResolvedValue({
      id: 'attempt-1',
      status: 'SUBMITTED',
    } as any);

    await expect(quizService.startAttempt('set-1', 'user-1'))
      .rejects.toThrow('ATTEMPT_ALREADY_SUBMITTED');
  });

  it('should return existing IN_PROGRESS attempt', async () => {
    const mockSet = { id: 'set-1', status: 'PUBLISHED', archivedAt: null, questions: [] };
    prismaMock.quizSet.findFirst.mockResolvedValue(mockSet as any);

    const existingAttempt = {
      id: 'attempt-1',
      status: 'IN_PROGRESS',
      userId: 'user-1',
      quizSetId: 'set-1',
    };
    prismaMock.quizAttempt.findUnique.mockResolvedValue(existingAttempt as any);

    const result = await quizService.startAttempt('set-1', 'user-1');

    expect(result.id).toBe('attempt-1');
    expect(prismaMock.quizAttempt.create).not.toHaveBeenCalled();
  });
});

describe('publishSet', () => {
  it('should publish set with valid questions', async () => {
    const mockSet = {
      id: 'set-1',
      questions: [
        { id: 'q1', options: [{ id: 'o1', isCorrect: true }, { id: 'o2', isCorrect: false }] },
      ],
    };
    prismaMock.quizSet.findUnique.mockResolvedValue(mockSet as any);
    prismaMock.quizSet.update.mockResolvedValue({ ...mockSet, status: 'PUBLISHED' } as any);

    const result = await quizService.publishSet('set-1');

    expect(result.status).toBe('PUBLISHED');
  });

  it('should throw QUIZ_MISSING_QUESTIONS for empty set', async () => {
    prismaMock.quizSet.findUnique.mockResolvedValue({
      id: 'set-1',
      questions: [],
    } as any);

    await expect(quizService.publishSet('set-1'))
      .rejects.toThrow('QUIZ_MISSING_QUESTIONS');
  });

  it('should throw QUESTION_MISSING_CORRECT_OPTION when no correct answer', async () => {
    prismaMock.quizSet.findUnique.mockResolvedValue({
      id: 'set-1',
      questions: [
        { id: 'q1', options: [{ id: 'o1', isCorrect: false }, { id: 'o2', isCorrect: false }] },
      ],
    } as any);

    await expect(quizService.publishSet('set-1'))
      .rejects.toThrow('QUESTION_MISSING_CORRECT_OPTION');
  });

  it('should throw NOT_FOUND for nonexistent set', async () => {
    prismaMock.quizSet.findUnique.mockResolvedValue(null);

    await expect(quizService.publishSet('nonexistent'))
      .rejects.toThrow('NOT_FOUND');
  });
});

describe('createTopic', () => {
  it('should create topic with auto-generated slug', async () => {
    prismaMock.quizTopic.create.mockResolvedValue({
      id: 'topic-1',
      slug: 'lich-su-viet-nam',
      title: 'Lịch sử Việt Nam',
      description: null,
      order: 0,
      isActive: true,
      archivedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await quizService.createTopic({ title: 'Lịch sử Việt Nam' });

    expect(prismaMock.quizTopic.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        title: 'Lịch sử Việt Nam',
        slug: 'lich-su-viet-nam',
      }),
    });
  });

  it('should use provided slug when given', async () => {
    prismaMock.quizTopic.create.mockResolvedValue({} as any);

    await quizService.createTopic({ title: 'Test', slug: 'custom-slug' });

    expect(prismaMock.quizTopic.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ slug: 'custom-slug' }),
    });
  });
});

describe('getLeaderboard', () => {
  it('should return leaderboard sorted by score desc, timeTaken asc', async () => {
    const mockLeaderboard = [
      { id: 'a1', score: 100, maxScore: 100, timeTaken: 30, submittedAt: new Date(), user: { id: 'u1', displayName: 'User 1', avatarUrl: null } },
      { id: 'a2', score: 80, maxScore: 100, timeTaken: 45, submittedAt: new Date(), user: { id: 'u2', displayName: 'User 2', avatarUrl: null } },
    ];
    prismaMock.quizAttempt.findMany.mockResolvedValue(mockLeaderboard as any);

    const result = await quizService.getLeaderboard('set-1');

    expect(result).toHaveLength(2);
    expect(prismaMock.quizAttempt.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: [{ score: 'desc' }, { timeTaken: 'asc' }, { submittedAt: 'asc' }],
        take: 10,
      })
    );
  });

  it('should cap limit at 50', async () => {
    prismaMock.quizAttempt.findMany.mockResolvedValue([]);

    await quizService.getLeaderboard('set-1', 100);

    expect(prismaMock.quizAttempt.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ take: 50 })
    );
  });
});
