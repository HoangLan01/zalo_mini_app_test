import { Prisma, QuizAttemptStatus, QuizSetStatus } from '@prisma/client';
import { prisma } from '../server';

const activeWhere = { archivedAt: null };

const publicQuestionSelect = {
  id: true,
  content: true,
  type: true,
  points: true,
  order: true,
  options: {
    where: activeWhere,
    orderBy: { order: 'asc' as const },
    select: {
      id: true,
      content: true,
      order: true
    }
  }
};

export const slugify = (value: string) => value
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-+|-+$/g, '')
  .slice(0, 120);

export const getPublicTopics = async () => {
  return prisma.quizTopic.findMany({
    where: { archivedAt: null, isActive: true, sets: { some: { status: { in: ['PUBLISHED', 'CLOSED'] }, archivedAt: null } } },
    orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
    select: {
      id: true,
      slug: true,
      title: true,
      description: true,
      order: true,
      _count: { select: { sets: true } }
    }
  });
};

export const getPublicSetsByTopic = async (topicId: string, userId: string) => {
  const sets = await prisma.quizSet.findMany({
    where: { topicId, archivedAt: null, status: { in: ['PUBLISHED', 'CLOSED'] } },
    orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
    include: {
      questions: { where: activeWhere, select: { id: true } },
      attempts: { where: { userId }, select: { id: true, status: true, score: true, maxScore: true, timeTaken: true, submittedAt: true } }
    }
  });

  return sets.map(({ questions, attempts, ...set }) => ({
    ...set,
    questionCount: questions.length,
    attempt: attempts[0] || null
  }));
};

export const getPublicSet = async (setId: string, userId: string) => {
  const set = await prisma.quizSet.findFirst({
    where: { id: setId, archivedAt: null, status: { in: ['PUBLISHED', 'CLOSED'] } },
    include: {
      topic: { select: { id: true, title: true, slug: true } },
      questions: {
        where: activeWhere,
        orderBy: { order: 'asc' },
        select: publicQuestionSelect
      },
      attempts: { where: { userId }, select: { id: true, status: true, score: true, maxScore: true, timeTaken: true, submittedAt: true } }
    }
  });

  if (!set) throw new Error('NOT_FOUND');

  const { attempts, ...data } = set;
  return { ...data, attempt: attempts[0] || null };
};

export const startAttempt = async (setId: string, userId: string) => {
  const set = await prisma.quizSet.findFirst({
    where: { id: setId, archivedAt: null, status: 'PUBLISHED' },
    include: { questions: { where: activeWhere, select: { points: true } } }
  });

  if (!set) throw new Error('QUIZ_NOT_OPEN');

  const existing = await prisma.quizAttempt.findUnique({
    where: { userId_quizSetId: { userId, quizSetId: setId } }
  });

  if (existing?.status === 'SUBMITTED' || existing?.status === 'EXPIRED') {
    throw new Error('ATTEMPT_ALREADY_SUBMITTED');
  }

  if (existing) return existing;

  return prisma.quizAttempt.create({
    data: {
      userId,
      quizSetId: setId,
      maxScore: set.questions.reduce((sum, q) => sum + q.points, 0)
    }
  });
};

export const submitAttempt = async (
  attemptId: string,
  userId: string,
  input: { timeTaken: number; answers: { questionId: string; selectedOptionId?: string | null }[]; expired?: boolean }
) => {
  const attempt = await prisma.quizAttempt.findFirst({
    where: { id: attemptId, userId },
    include: {
      quizSet: {
        include: {
          questions: {
            where: activeWhere,
            include: { options: { where: activeWhere, orderBy: { order: 'asc' } } },
            orderBy: { order: 'asc' }
          }
        }
      }
    }
  });

  if (!attempt) throw new Error('NOT_FOUND');
  if (attempt.status !== 'IN_PROGRESS') throw new Error('ATTEMPT_ALREADY_SUBMITTED');

  const answerMap = new Map(input.answers.map(answer => [answer.questionId, answer.selectedOptionId || null]));
  let score = 0;
  const maxScore = attempt.quizSet.questions.reduce((sum, question) => sum + question.points, 0);

  const answerRows = attempt.quizSet.questions.map(question => {
    const selectedOptionId = answerMap.get(question.id) || null;
    const selectedOption = question.options.find(option => option.id === selectedOptionId) || null;
    const correctOption = question.options.find(option => option.isCorrect) || null;
    const isCorrect = Boolean(selectedOption && correctOption && selectedOption.id === correctOption.id);
    const pointsAwarded = isCorrect ? question.points : 0;
    score += pointsAwarded;

    return {
      attemptId,
      questionId: question.id,
      selectedOptionId: selectedOption?.id,
      isCorrect,
      pointsAwarded,
      questionContent: question.content,
      selectedOptionContent: selectedOption?.content,
      correctOptionContent: correctOption?.content
    };
  });

  const status: QuizAttemptStatus = input.expired ? 'EXPIRED' : 'SUBMITTED';

  return prisma.$transaction(async tx => {
    await tx.quizAttemptAnswer.deleteMany({ where: { attemptId } });
    await tx.quizAttemptAnswer.createMany({ data: answerRows });
    return tx.quizAttempt.update({
      where: { id: attemptId },
      data: {
        score,
        maxScore,
        timeTaken: Math.max(0, input.timeTaken),
        status,
        submittedAt: new Date()
      },
      include: { answers: true }
    });
  });
};

export const getResult = async (setId: string, userId: string) => {
  const attempt = await prisma.quizAttempt.findUnique({
    where: { userId_quizSetId: { userId, quizSetId: setId } },
    include: {
      quizSet: { select: { id: true, title: true, timeLimit: true, topic: { select: { id: true, title: true } } } },
      answers: { orderBy: { createdAt: 'asc' } }
    }
  });

  if (!attempt || attempt.status === 'IN_PROGRESS') throw new Error('NOT_FOUND');
  return attempt;
};

export const getLeaderboard = async (setId: string, limit = 10) => {
  return prisma.quizAttempt.findMany({
    where: { quizSetId: setId, status: { in: ['SUBMITTED', 'EXPIRED'] } },
    orderBy: [{ score: 'desc' }, { timeTaken: 'asc' }, { submittedAt: 'asc' }],
    take: Math.min(limit, 50),
    select: {
      id: true,
      score: true,
      maxScore: true,
      timeTaken: true,
      submittedAt: true,
      user: { select: { id: true, displayName: true, avatarUrl: true } }
    }
  });
};

export const getAdminTopics = async () => {
  return prisma.quizTopic.findMany({
    where: { archivedAt: null },
    orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
    include: { _count: { select: { sets: true } } }
  });
};

export const createTopic = async (data: { title: string; slug?: string; description?: string; order?: number; isActive?: boolean }) => {
  return prisma.quizTopic.create({
    data: {
      title: data.title,
      slug: data.slug || slugify(data.title),
      description: data.description,
      order: data.order || 0,
      isActive: data.isActive ?? true
    }
  });
};

export const updateTopic = async (id: string, data: { title?: string; slug?: string; description?: string | null; order?: number; isActive?: boolean }) => {
  return prisma.quizTopic.update({ where: { id }, data });
};

export const archiveTopic = async (id: string) => {
  return prisma.quizTopic.update({ where: { id }, data: { archivedAt: new Date(), isActive: false } });
};

export const getAdminSets = async (topicId?: string) => {
  return prisma.quizSet.findMany({
    where: { archivedAt: null, ...(topicId ? { topicId } : {}) },
    orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
    include: { topic: true, _count: { select: { questions: true, attempts: true } } }
  });
};

export const createSet = async (data: { topicId: string; title: string; description?: string; timeLimit: number; order?: number }) => {
  return prisma.quizSet.create({
    data: {
      topicId: data.topicId,
      title: data.title,
      description: data.description,
      timeLimit: data.timeLimit,
      order: data.order || 0
    }
  });
};

export const updateSet = async (id: string, data: { topicId?: string; title?: string; description?: string | null; timeLimit?: number; order?: number }) => {
  return prisma.quizSet.update({ where: { id }, data });
};

export const archiveSet = async (id: string) => {
  return prisma.quizSet.update({ where: { id }, data: { status: 'ARCHIVED', archivedAt: new Date() } });
};

export const publishSet = async (id: string) => {
  const set = await prisma.quizSet.findUnique({
    where: { id },
    include: { questions: { where: activeWhere, include: { options: { where: activeWhere } } } }
  });

  if (!set) throw new Error('NOT_FOUND');
  if (set.questions.length === 0) throw new Error('QUIZ_MISSING_QUESTIONS');
  if (set.questions.some(question => !question.options.some(option => option.isCorrect))) {
    throw new Error('QUESTION_MISSING_CORRECT_OPTION');
  }

  return prisma.quizSet.update({
    where: { id },
    data: { status: 'PUBLISHED', publishedAt: new Date(), closedAt: null }
  });
};

export const closeSet = async (id: string) => {
  return prisma.quizSet.update({ where: { id }, data: { status: 'CLOSED', closedAt: new Date() } });
};

export const getAdminQuestions = async (quizSetId: string) => {
  return prisma.quizQuestion.findMany({
    where: { quizSetId, archivedAt: null },
    orderBy: { order: 'asc' },
    include: { options: { where: activeWhere, orderBy: { order: 'asc' } } }
  });
};

export const createQuestion = async (data: {
  quizSetId: string;
  content: string;
  type: 'MULTIPLE_CHOICE' | 'TRUE_FALSE';
  points: number;
  order?: number;
  explanation?: string;
  options: { content: string; order?: number; isCorrect: boolean }[];
}) => {
  return prisma.quizQuestion.create({
    data: {
      quizSetId: data.quizSetId,
      content: data.content,
      type: data.type,
      points: data.points,
      order: data.order || 0,
      explanation: data.explanation,
      options: {
        create: data.options.map((option, index) => ({
          content: option.content,
          order: option.order ?? index,
          isCorrect: option.isCorrect
        }))
      }
    },
    include: { options: { orderBy: { order: 'asc' } } }
  });
};

export const updateQuestion = async (id: string, data: {
  content?: string;
  type?: 'MULTIPLE_CHOICE' | 'TRUE_FALSE';
  points?: number;
  order?: number;
  explanation?: string | null;
  options?: { content: string; order?: number; isCorrect: boolean }[];
}) => {
  return prisma.$transaction(async tx => {
    if (data.options) {
      await tx.quizOption.updateMany({
        where: { questionId: id, archivedAt: null },
        data: { archivedAt: new Date() }
      });
    }

    return tx.quizQuestion.update({
      where: { id },
      data: {
        content: data.content,
        type: data.type,
        points: data.points,
        order: data.order,
        explanation: data.explanation,
        options: data.options ? {
          create: data.options.map((option, index) => ({
            content: option.content,
            order: option.order ?? index,
            isCorrect: option.isCorrect
          }))
        } : undefined
      },
      include: { options: { where: activeWhere, orderBy: { order: 'asc' } } }
    });
  });
};

export const archiveQuestion = async (id: string) => {
  return prisma.quizQuestion.update({ where: { id }, data: { archivedAt: new Date() } });
};

export const getSetStats = async (id: string) => {
  const [attemptCount, avg, leaderboard] = await Promise.all([
    prisma.quizAttempt.count({ where: { quizSetId: id, status: { in: ['SUBMITTED', 'EXPIRED'] } } }),
    prisma.quizAttempt.aggregate({ where: { quizSetId: id, status: { in: ['SUBMITTED', 'EXPIRED'] } }, _avg: { score: true, timeTaken: true } }),
    getLeaderboard(id, 10)
  ]);

  return {
    attemptCount,
    averageScore: avg._avg.score || 0,
    averageTimeTaken: avg._avg.timeTaken || 0,
    leaderboard
  };
};

export const cloneSetToDraft = async (id: string) => {
  const source = await prisma.quizSet.findUnique({
    where: { id },
    include: { questions: { where: activeWhere, include: { options: { where: activeWhere, orderBy: { order: 'asc' } } }, orderBy: { order: 'asc' } } }
  });

  if (!source) throw new Error('NOT_FOUND');

  return prisma.quizSet.create({
    data: {
      topicId: source.topicId,
      title: `${source.title} (bản mới)`,
      description: source.description,
      timeLimit: source.timeLimit,
      version: source.version + 1,
      order: source.order,
      status: 'DRAFT' as QuizSetStatus,
      questions: {
        create: source.questions.map(question => ({
          content: question.content,
          type: question.type,
          points: question.points,
          order: question.order,
          explanation: question.explanation,
          options: {
            create: question.options.map(option => ({
              content: option.content,
              order: option.order,
              isCorrect: option.isCorrect
            }))
          }
        }))
      }
    }
  });
};

export const batchSaveQuestions = async (quizSetId: string, data: {
  questions: {
    id?: string;
    content: string;
    type: 'MULTIPLE_CHOICE' | 'TRUE_FALSE';
    points: number;
    order?: number;
    explanation?: string;
    options: { content: string; order?: number; isCorrect: boolean }[];
  }[];
  deletedIds: string[];
}) => {
  return prisma.$transaction(async tx => {
    if (data.deletedIds.length > 0) {
      await tx.quizQuestion.updateMany({
        where: { id: { in: data.deletedIds } },
        data: { archivedAt: new Date() }
      });
    }

    const results = [];
    for (const q of data.questions) {
      const qId = (q.id && q.id.startsWith('draft-')) ? undefined : q.id;
      if (qId) {
        if (q.options) {
          await tx.quizOption.updateMany({
            where: { questionId: qId, archivedAt: null },
            data: { archivedAt: new Date() }
          });
        }
        const updated = await tx.quizQuestion.update({
          where: { id: qId },
          data: {
            content: q.content,
            type: q.type,
            points: q.points,
            order: q.order,
            explanation: q.explanation,
            options: q.options ? {
              create: q.options.map((opt, idx) => ({
                content: opt.content,
                order: opt.order ?? idx,
                isCorrect: opt.isCorrect
              }))
            } : undefined
          },
          include: { options: { where: activeWhere, orderBy: { order: 'asc' } } }
        });
        results.push(updated);
      } else {
        const created = await tx.quizQuestion.create({
          data: {
            quizSetId,
            content: q.content,
            type: q.type,
            points: q.points,
            order: q.order || 0,
            explanation: q.explanation,
            options: {
              create: q.options.map((opt, idx) => ({
                content: opt.content,
                order: opt.order ?? idx,
                isCorrect: opt.isCorrect
              }))
            }
          },
          include: { options: { orderBy: { order: 'asc' } } }
        });
        results.push(created);
      }
    }
    return results;
  });
};

export const getDashboardStats = async () => {
  const fourteenDaysAgo = new Date();
  fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 13);
  fourteenDaysAgo.setHours(0, 0, 0, 0);

  const [
    totalUsers,
    totalTopics,
    totalSets,
    totalAttempts,
    statusGroups,
    dailyRaw,
    topUsersRaw,
    recentAttempts
  ] = await Promise.all([
    prisma.user.count(),
    prisma.quizTopic.count({ where: { archivedAt: null } }),
    prisma.quizSet.count({ where: { archivedAt: null } }),
    prisma.quizAttempt.count({ where: { status: { in: ['SUBMITTED', 'EXPIRED'] } } }),

    prisma.quizSet.groupBy({
      by: ['status'],
      _count: true,
      where: { archivedAt: null }
    }),

    prisma.$queryRaw<{ date: string; count: bigint }[]>`
      SELECT DATE("submittedAt") as date, COUNT(*)::bigint as count
      FROM quiz_attempts
      WHERE status IN ('SUBMITTED', 'EXPIRED')
        AND "submittedAt" >= ${fourteenDaysAgo}
      GROUP BY DATE("submittedAt")
      ORDER BY date ASC
    `,

    prisma.$queryRaw<{ userId: string; displayName: string; avatarUrl: string | null; totalScore: bigint; attemptCount: bigint }[]>`
      SELECT u.id as "userId", u."displayName", u."avatarUrl",
             SUM(a.score)::bigint as "totalScore",
             COUNT(a.id)::bigint as "attemptCount"
      FROM quiz_attempts a
      JOIN users u ON u.id = a."userId"
      WHERE a.status IN ('SUBMITTED', 'EXPIRED')
      GROUP BY u.id, u."displayName", u."avatarUrl"
      ORDER BY "totalScore" DESC, "attemptCount" DESC
      LIMIT 10
    `,

    prisma.quizAttempt.findMany({
      where: { status: { in: ['SUBMITTED', 'EXPIRED'] } },
      orderBy: { submittedAt: 'desc' },
      take: 10,
      select: {
        id: true,
        score: true,
        maxScore: true,
        timeTaken: true,
        submittedAt: true,
        user: { select: { displayName: true, avatarUrl: true } },
        quizSet: { select: { title: true } }
      }
    })
  ]);

  // Fill missing days in the 14-day range
  const dailyMap = new Map(dailyRaw.map(r => [r.date.toString().slice(0, 10), Number(r.count)]));
  const dailyAttempts: { date: string; count: number }[] = [];
  for (let i = 0; i < 14; i++) {
    const d = new Date(fourteenDaysAgo);
    d.setDate(d.getDate() + i);
    const key = d.toISOString().slice(0, 10);
    dailyAttempts.push({ date: key, count: dailyMap.get(key) || 0 });
  }

  return {
    summary: { totalUsers, totalTopics, totalSets, totalAttempts },
    dailyAttempts,
    statusDistribution: statusGroups.map(g => ({ status: g.status, count: g._count })),
    topUsers: topUsersRaw.map(u => ({
      userId: u.userId,
      displayName: u.displayName,
      avatarUrl: u.avatarUrl,
      totalScore: Number(u.totalScore),
      attemptCount: Number(u.attemptCount)
    })),
    recentAttempts
  };
};
