// src/services/googleSheets.service.ts
import { google } from 'googleapis';
import logger from '../utils/logger';

const getSheetsClient = () => {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  });
  return google.sheets({ version: 'v4', auth });
};

const cache = new Map<string, { data: string[][]; expiresAt: number }>();

export const getSheetData = async (sheetId: string, range: string): Promise<string[][]> => {
  if (!sheetId) return [];

  const cacheKey = `${sheetId}_${range}`;
  const cached = cache.get(cacheKey);

  if (cached && cached.expiresAt > Date.now()) {
    return cached.data;
  }

  try {
    const sheets = getSheetsClient();
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range,
    });

    const rows = response.data.values || [];
    const values = rows.slice(1); // Bỏ hàng đầu tiên (header)

    const ttl = parseInt(process.env.CACHE_TTL_SHEETS || '300');
    cache.set(cacheKey, { data: values, expiresAt: Date.now() + ttl * 1000 });

    return values;
  } catch (error: any) {
    logger.error(`Error fetching sheet data (ID: ${sheetId}):`, error.message);
    return [];
  }
};

export const parseNewsRow = (row: string[]) => {
  try {
    const [id, title, summary, content, thumbnailUrl, category, featured, publishedAt, isActive] = row;
    if (isActive !== 'TRUE') return null;
    if (!id || !title) return null;

    return {
      id,
      title,
      summary,
      content,
      thumbnailUrl,
      category,
      featured: featured === 'TRUE',
      publishedAt
    };
  } catch (e) {
    logger.warn('Failed to parse News row');
    return null;
  }
};

export const parseEventRow = (row: string[]) => {
  try {
    const [id, title, description, thumbnailUrl, category, location, startAt, endAt, organizer, contactInfo, isActive] = row;
    if (isActive !== 'TRUE') return null;
    if (!id || !title) return null;

    return {
      id,
      title,
      description,
      thumbnailUrl,
      category,
      location,
      startAt,
      endAt,
      organizer,
      contactInfo
    };
  } catch (e) {
    logger.warn('Failed to parse Event row');
    return null;
  }
};

export const parseHeritageRow = (row: string[]) => {
  try {
    const [id, name, type, description, imageUrlsJson, address, rankingYear, rankingLevel, conservationStatus, openingHours, contactInfo, isActive] = row;
    if (isActive !== 'TRUE') return null;
    if (!id || !name) return null;

    let imageUrls: string[] = [];
    try {
      imageUrls = JSON.parse(imageUrlsJson);
    } catch {
      // ignore
    }

    return {
      id,
      name,
      type,
      description,
      imageUrls,
      address,
      rankingYear,
      rankingLevel,
      conservationStatus,
      openingHours,
      contactInfo
    };
  } catch (e) {
    logger.warn('Failed to parse Heritage row');
    return null;
  }
};
