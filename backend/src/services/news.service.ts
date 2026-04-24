// src/services/news.service.ts
import { getSheetData, parseNewsRow } from './googleSheets.service';

export const getAllNews = async (filters: { category?: string, featured?: string, page: number, limit: number }) => {
  const sheetId = process.env.GOOGLE_SHEETS_NEWS_ID;
  const rows = await getSheetData(sheetId || '', 'A:I');

  let data = rows.map(parseNewsRow).filter(item => item !== null) as any[];

  if (filters.category) {
    data = data.filter(item => item.category === filters.category);
  }

  if (filters.featured === 'true') {
    data = data.filter(item => item.featured === true);
  }

  data.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

  const total = data.length;
  const skip = (filters.page - 1) * filters.limit;
  const paginatedData = data.slice(skip, skip + filters.limit);

  return {
    data: paginatedData,
    pagination: {
      page: filters.page,
      limit: filters.limit,
      total,
      totalPages: Math.ceil(total / filters.limit)
    }
  };
};

export const getNewsById = async (id: string) => {
  const sheetId = process.env.GOOGLE_SHEETS_NEWS_ID;
  const rows = await getSheetData(sheetId || '', 'A:I');
  
  for (const row of rows) {
    const item = parseNewsRow(row);
    if (item && item.id === id) return item;
  }
  
  return null;
};
