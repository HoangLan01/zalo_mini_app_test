import { Prisma, QuizAttemptStatus, QuizSetStatus } from '@prisma/client';
import { prisma } from '../server';
import { AppError } from '../utils/appError';

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
       attempts: { where: { userId }, select: { id: true, status: true, score: true, maxScore: true, timeTaken: true, startedAt: true, submittedAt: true } }
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
       attempts: { where: { userId }, select: { id: true, status: true, score: true, maxScore: true, timeTaken: true, startedAt: true, submittedAt: true } }
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

  const elapsedSeconds = Math.max(0, Math.floor((Date.now() - attempt.startedAt.getTime()) / 1000));
  const timeTaken = Math.min(elapsedSeconds, attempt.quizSet.timeLimit);
  const status: QuizAttemptStatus = input.expired || elapsedSeconds >= attempt.quizSet.timeLimit ? 'EXPIRED' : 'SUBMITTED';

  return prisma.$transaction(async tx => {
    await tx.quizAttemptAnswer.deleteMany({ where: { attemptId } });
    await tx.quizAttemptAnswer.createMany({ data: answerRows });
    return tx.quizAttempt.update({
      where: { id: attemptId },
      data: {
        score,
        maxScore,
          timeTaken,
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

export const getArchivedAdminTopics = async () => {
  return prisma.quizTopic.findMany({
    where: { archivedAt: { not: null } },
    orderBy: { archivedAt: 'desc' },
    include: { _count: { select: { sets: true } } }
  });
};

export const createTopic = async (data: { title: string; slug?: string; description?: string; order?: number; isActive?: boolean }) => {
  const slug = data.slug || slugify(data.title);
  if (!slug) {
    throw new AppError('INVALID_TOPIC_SLUG', 'Tên chủ đề phải chứa ít nhất một ký tự chữ hoặc số.', 400);
  }

  const existingTopic = await prisma.quizTopic.findUnique({
    where: { slug },
    select: { archivedAt: true }
  });

  if (existingTopic) {
    const message = existingTopic.archivedAt
      ? 'Chủ đề này đã tồn tại trong danh sách lưu trữ. Vui lòng xóa vĩnh viễn hoặc dùng tên khác.'
      : 'Chủ đề với tên hoặc slug này đã tồn tại.';
    throw new AppError('QUIZ_TOPIC_SLUG_EXISTS', message, 409);
  }

  try {
    return await prisma.quizTopic.create({
      data: {
        title: data.title,
        slug,
        description: data.description,
        order: data.order || 0,
        isActive: data.isActive ?? true
      }
    });
  } catch (error) {
    // The pre-check gives a helpful message, while this also covers two
    // concurrent create requests that choose the same slug.
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      throw new AppError('QUIZ_TOPIC_SLUG_EXISTS', 'Chủ đề với tên hoặc slug này đã tồn tại.', 409);
    }
    throw error;
  }
};

export const updateTopic = async (id: string, data: { title?: string; slug?: string; description?: string | null; order?: number; isActive?: boolean }) => {
  return prisma.quizTopic.update({ where: { id }, data });
};

export const archiveTopic = async (id: string) => {
  return prisma.quizTopic.update({ where: { id }, data: { archivedAt: new Date(), isActive: false } });
};

export const permanentlyDeleteArchivedTopic = async (id: string) => {
  return prisma.$transaction(async (tx) => {
    const topic = await tx.quizTopic.findUnique({
      where: { id },
      select: { archivedAt: true }
    });

    if (!topic) throw new AppError('NOT_FOUND', 'Không tìm thấy chủ đề.', 404);
    if (!topic.archivedAt) {
      throw new AppError('TOPIC_NOT_ARCHIVED', 'Chỉ có thể xóa vĩnh viễn chủ đề đã lưu trữ.', 400);
    }

    const topicSetFilter = { quizSet: { topicId: id } };
    await tx.quizAttemptAnswer.deleteMany({ where: { attempt: topicSetFilter } });
    await tx.quizOption.deleteMany({ where: { question: topicSetFilter } });
    await tx.quizQuestion.deleteMany({ where: topicSetFilter });
    await tx.quizAttempt.deleteMany({ where: topicSetFilter });
    await tx.quizSet.deleteMany({ where: { topicId: id } });

    return tx.quizTopic.delete({ where: { id } });
  });
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

export const getDashboardStats = async (startDate?: string, endDate?: string) => {
  const end = endDate ? new Date(endDate) : new Date();
  end.setHours(23, 59, 59, 999);
  
  const start = startDate ? new Date(startDate) : new Date(end);
  if (!startDate) {
    start.setDate(end.getDate() - 13);
  }
  start.setHours(0, 0, 0, 0);

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
    prisma.quizAttempt.count(),

    prisma.quizSet.groupBy({
      by: ['status'],
      _count: true,
      where: { archivedAt: null }
    }),

    prisma.$queryRaw<{ date: string; count: bigint }[]>`
      SELECT DATE("startedAt" AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Ho_Chi_Minh') as date, COUNT(*)::bigint as count
      FROM quiz_attempts
      WHERE "startedAt" >= ${start}
        AND "startedAt" <= ${end}
      GROUP BY date
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

  // Fill missing days in the selected range using Vietnam Timezone for keys
  const dailyMap = new Map();
  dailyRaw.forEach(r => {
    // Ensure we handle different possible date formats from $queryRaw
    const dateStr = (r.date as any) instanceof Date 
      ? (r.date as any).toISOString().slice(0, 10) 
      : String(r.date).slice(0, 10);
    dailyMap.set(dateStr, Number(r.count));
  });

  const dailyAttempts: { date: string; count: number }[] = [];
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  for (let i = 0; i <= diffDays; i++) {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    // Format to YYYY-MM-DD in Vietnam timezone
    const key = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Ho_Chi_Minh' }).format(d);
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
