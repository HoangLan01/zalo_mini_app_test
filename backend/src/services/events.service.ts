import { EventCategory, EventStatus, Prisma } from '@prisma/client';
import sanitizeHtml from 'sanitize-html';
import { prisma } from '../server';

type EventInput = {
  title: string;
  description: string;
  category: EventCategory;
  location: string;
  startAt: string | Date;
  endAt: string | Date;
  organizer: string;
  contactInfo?: string | null;
  imageUrls: string[];
  thumbnailUrl: string;
  order?: number;
};

type EventQuery = {
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
};

const parseDate = (value: string | Date) => {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) throw new Error('EVENT_INVALID_DATE');
  return date;
};

const sanitizeEventDescription = (description: string) => {
  const sanitized = sanitizeHtml(description || '', {
    allowedTags: ['p', 'br', 'strong', 'em', 'u', 'h2', 'h3', 'ul', 'ol', 'li', 'a', 'img'],
    allowedAttributes: {
      a: ['href', 'target', 'rel'],
      img: ['src', 'alt', 'title']
    },
    allowedSchemes: ['http', 'https', 'mailto'],
    allowedSchemesByTag: {
      img: ['http', 'https']
    },
    transformTags: {
      a: sanitizeHtml.simpleTransform('a', {
        target: '_blank',
        rel: 'noopener noreferrer'
      }, true)
    }
  }).trim();

  const textContent = sanitizeHtml(sanitized, {
    allowedTags: [],
    allowedAttributes: {}
  }).replace(/\s+/g, ' ').trim();

  const hasImage = /<img\b[^>]*\bsrc=(["'])https?:\/\/[^"']+\1/i.test(sanitized);
  if (!textContent && !hasImage) throw new Error('EVENT_MISSING_DESCRIPTION');
  return sanitized;
};

const validateEventInput = (input: EventInput, publishing = false) => {
  const startAt = parseDate(input.startAt);
  const endAt = parseDate(input.endAt);
  const description = sanitizeEventDescription(input.description);

  if (endAt < startAt) throw new Error('EVENT_INVALID_DATE_RANGE');

  const imageUrls = Array.from(new Set((input.imageUrls || []).filter(Boolean)));
  const thumbnailUrl = input.thumbnailUrl || imageUrls[0] || '';
  if (publishing && imageUrls.length === 0) throw new Error('EVENT_MISSING_IMAGES');
  if (publishing && !thumbnailUrl) throw new Error('EVENT_MISSING_THUMBNAIL');
  if (thumbnailUrl && !imageUrls.includes(thumbnailUrl)) throw new Error('EVENT_THUMBNAIL_NOT_IN_IMAGES');

  return {
    ...input,
    description,
    startAt,
    endAt,
    imageUrls,
    thumbnailUrl
  };
};

const withPublicStatus = <T extends { startAt: Date; endAt: Date }>(event: T) => {
  const now = new Date();
  const status = event.endAt < now ? 'past' : event.startAt > now ? 'upcoming' : 'ongoing';
  return { ...event, status };
};

const getPagination = (query: EventQuery) => {
  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.min(50, Math.max(1, Number(query.limit) || 10));
  return { page, limit, skip: (page - 1) * limit };
};

export const getAdminEvents = async (query: EventQuery) => {
  const { page, limit, skip } = getPagination(query);
  const where: Prisma.EventWhereInput = {
    archivedAt: null,
    ...(query.status && query.status !== 'ALL' ? { status: query.status as EventStatus } : {}),
    ...(query.search ? {
      OR: [
        { title: { contains: query.search, mode: 'insensitive' } },
        { location: { contains: query.search, mode: 'insensitive' } },
        { organizer: { contains: query.search, mode: 'insensitive' } }
      ]
    } : {})
  };

  const [items, total] = await Promise.all([
    prisma.event.findMany({
      where,
      orderBy: [{ order: 'asc' }, { startAt: 'desc' }, { createdAt: 'desc' }],
      skip,
      take: limit
    }),
    prisma.event.count({ where })
  ]);

  return { items, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
};

export const createEvent = async (input: EventInput) => {
  const data = validateEventInput(input);
  return prisma.event.create({
    data: {
      ...data,
      order: data.order || 0,
      contactInfo: data.contactInfo || null
    }
  });
};

export const updateEvent = async (id: string, input: Partial<EventInput>) => {
  const existing = await prisma.event.findFirst({ where: { id, archivedAt: null } });
  if (!existing) throw new Error('NOT_FOUND');

  const merged = validateEventInput({
    title: input.title ?? existing.title,
    description: input.description ?? existing.description,
    category: input.category ?? existing.category,
    location: input.location ?? existing.location,
    startAt: input.startAt ?? existing.startAt,
    endAt: input.endAt ?? existing.endAt,
    organizer: input.organizer ?? existing.organizer,
    contactInfo: input.contactInfo ?? existing.contactInfo,
    imageUrls: input.imageUrls ?? existing.imageUrls,
    thumbnailUrl: input.thumbnailUrl ?? existing.thumbnailUrl,
    order: input.order ?? existing.order
  });

  return prisma.event.update({
    where: { id },
    data: {
      title: merged.title,
      description: merged.description,
      category: merged.category,
      location: merged.location,
      startAt: merged.startAt,
      endAt: merged.endAt,
      organizer: merged.organizer,
      contactInfo: merged.contactInfo || null,
      imageUrls: merged.imageUrls,
      thumbnailUrl: merged.thumbnailUrl,
      order: merged.order
    }
  });
};

export const archiveEvent = async (id: string) => {
  return prisma.event.update({
    where: { id },
    data: { status: 'ARCHIVED', archivedAt: new Date() }
  });
};

export const publishEvent = async (id: string) => {
  const event = await prisma.event.findFirst({ where: { id, archivedAt: null } });
  if (!event) throw new Error('NOT_FOUND');

  validateEventInput(event, true);

  return prisma.event.update({
    where: { id },
    data: { status: 'PUBLISHED', publishedAt: new Date(), closedAt: null }
  });
};

export const closeEvent = async (id: string) => {
  return prisma.event.update({
    where: { id },
    data: { status: 'CLOSED', closedAt: new Date() }
  });
};

export const getPublicEvents = async (query: EventQuery) => {
  const { page, limit, skip } = getPagination(query);
  const now = new Date();
  const statusWhere: Prisma.EventWhereInput =
    query.status === 'upcoming' ? { startAt: { gt: now } } :
    query.status === 'ongoing' ? { startAt: { lte: now }, endAt: { gte: now } } :
    query.status === 'past' ? { endAt: { lt: now } } :
    {};

  const where: Prisma.EventWhereInput = {
    archivedAt: null,
    status: 'PUBLISHED',
    ...statusWhere
  };

  const [items, total] = await Promise.all([
    prisma.event.findMany({
      where,
      orderBy: [{ order: 'asc' }, { startAt: 'asc' }],
      skip,
      take: limit
    }),
    prisma.event.count({ where })
  ]);

  return {
    items: items.map(withPublicStatus),
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
  };
};

export const getPublicEvent = async (id: string) => {
  const event = await prisma.event.findFirst({
    where: { id, archivedAt: null, status: 'PUBLISHED' }
  });
  if (!event) throw new Error('NOT_FOUND');
  return withPublicStatus(event);
};
