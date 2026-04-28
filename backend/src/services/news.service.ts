// src/services/news.service.ts
import { prisma } from '../server';

export const getAllNews = async (filters: { category?: string, featured?: string, page: number, limit: number }) => {
  const skip = (filters.page - 1) * filters.limit;
  
  const whereClause: any = {};
  if (filters.category) {
    whereClause.category = filters.category;
  }

  const [total, items] = await Promise.all([
    prisma.article.count({ where: whereClause }),
    prisma.article.findMany({
      where: whereClause,
      orderBy: { publishedAt: 'desc' },
      skip,
      take: filters.limit
    })
  ]);

  return {
    data: items,
    pagination: {
      page: filters.page,
      limit: filters.limit,
      total,
      totalPages: Math.ceil(total / filters.limit)
    }
  };
};

export const getNewsById = async (id: string) => {
  const item = await prisma.article.findUnique({
    where: { id }
  });
  return item;
};
