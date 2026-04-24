// src/services/heritage.service.ts
import { getSheetData, parseHeritageRow } from './googleSheets.service';

export const getAllHeritage = async (filters: { search?: string, page: number, limit: number }) => {
  const sheetId = process.env.GOOGLE_SHEETS_HERITAGE_ID;
  const rows = await getSheetData(sheetId || '', 'A:L');

  let data = rows.map(parseHeritageRow).filter(item => item !== null) as any[];

  if (filters.search) {
    const term = filters.search.toLowerCase();
    data = data.filter(item => item.name.toLowerCase().includes(term));
  }

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

export const getHeritageById = async (id: string) => {
  const sheetId = process.env.GOOGLE_SHEETS_HERITAGE_ID;
  const rows = await getSheetData(sheetId || '', 'A:L');
  
  for (const row of rows) {
    const item = parseHeritageRow(row);
    if (item && item.id === id) return item;
  }
  
  return null;
};
