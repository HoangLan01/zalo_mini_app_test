// src/services/rating.service.ts
import { prisma } from '../server';
import { sendLowRatingAlert } from './zaloOA.service';

interface CreateRatingInput {
  procedure: string;
  attitudeScore: number;
  timelinessScore: number;
  outcomeScore: number;
  comment?: string;
}

interface RatingSummary {
  averageScore: number;
  totalCount: number;
  distribution: { stars: number; count: number }[];
}

// In-memory cache
const cache = new Map<string, { data: RatingSummary; expiresAt: number }>();

export const createRating = async (userId: string, data: CreateRatingInput) => {
  const avg = (data.attitudeScore + data.timelinessScore + data.outcomeScore) / 3;
  const averageScore = Math.round(avg * 10) / 10;

  const rating = await prisma.rating.create({
    data: {
      userId,
      procedure: data.procedure,
      attitudeScore: data.attitudeScore,
      timelinessScore: data.timelinessScore,
      outcomeScore: data.outcomeScore,
      averageScore,
      comment: data.comment
    },
    include: { user: true }
  });

  if (averageScore <= 2) {
    sendLowRatingAlert(rating, rating.user).then(() => {
      prisma.rating.update({
        where: { id: rating.id },
        data: { alertSent: true }
      }).catch();
    });
  }

  // Invalidate cache
  cache.delete('rating_summary');

  return rating;
};

export const getRatingSummary = async (): Promise<RatingSummary> => {
  const cached = cache.get('rating_summary');
  if (cached && cached.expiresAt > Date.now()) {
    return cached.data;
  }

  const totalCount = await prisma.rating.count();
  
  if (totalCount === 0) {
    return { averageScore: 0, totalCount: 0, distribution: [] };
  }

  const avgResult = await prisma.rating.aggregate({ _avg: { averageScore: true } });
  const averageScore = Math.round((avgResult._avg.averageScore || 0) * 10) / 10;

  // Manual distribution calculation since Prisma groupBy on computed values isn't straightforward
  // without raw SQL, but we can do a simple Prisma groupBy on rounded fields if we had them.
  // We'll just fetch all and group in memory (fine for small scale, but let's do a raw query for better practice if needed. Wait, we are trying to keep it simple.)
  const ratings = await prisma.rating.findMany({ select: { averageScore: true } });
  
  const distMap: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  for (const r of ratings) {
    const star = Math.round(r.averageScore);
    if (distMap[star] !== undefined) distMap[star]++;
  }

  const distribution = Object.entries(distMap).map(([stars, count]) => ({
    stars: parseInt(stars),
    count
  })).reverse(); // 5 to 1

  const summary = { averageScore, totalCount, distribution };
  
  // Cache 10 minutes
  cache.set('rating_summary', { data: summary, expiresAt: Date.now() + 10 * 60 * 1000 });

  return summary;
};
