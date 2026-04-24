// src/services/events.service.ts
import { getSheetData, parseEventRow } from './googleSheets.service';

export const getAllEvents = async (filters: { status?: 'upcoming'|'ongoing'|'past', page: number, limit: number }) => {
  const sheetId = process.env.GOOGLE_SHEETS_EVENTS_ID;
  const rows = await getSheetData(sheetId || '', 'A:K');

  let data = rows.map(parseEventRow).filter(item => item !== null) as any[];

  const now = new Date().getTime();

  if (filters.status) {
    data = data.filter(item => {
      const start = new Date(item.startAt).getTime();
      const end = new Date(item.endAt).getTime();

      if (filters.status === 'upcoming') return start > now;
      if (filters.status === 'ongoing') return start <= now && end >= now;
      if (filters.status === 'past') return end < now;
      return true;
    });
  }

  data.sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime());

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

export const getEventById = async (id: string) => {
  const sheetId = process.env.GOOGLE_SHEETS_EVENTS_ID;
  const rows = await getSheetData(sheetId || '', 'A:K');
  
  for (const row of rows) {
    const item = parseEventRow(row);
    if (item && item.id === id) return item;
  }
  
  return null;
};
