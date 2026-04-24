// src/utils/generateCode.ts
import { PrismaClient } from '@prisma/client';

export const getNextSequence = async (prisma: PrismaClient, model: 'feedback' | 'booking', year: number): Promise<number> => {
  const startOfYear = new Date(Date.UTC(year, 0, 1));
  const endOfYear = new Date(Date.UTC(year + 1, 0, 1));

  let count = 0;
  if (model === 'feedback') {
    count = await prisma.feedback.count({
      where: {
        createdAt: {
          gte: startOfYear,
          lt: endOfYear
        }
      }
    });
  } else if (model === 'booking') {
    count = await prisma.booking.count({
      where: {
        createdAt: {
          gte: startOfYear,
          lt: endOfYear
        }
      }
    });
  }

  return count + 1;
};

export const generateFeedbackCode = (year: number, sequence: number): string => {
  const paddedSeq = sequence.toString().padStart(4, '0');
  return `PA-${year}-${paddedSeq}`;
};

export const generateBookingCode = (year: number, sequence: number): string => {
  const paddedSeq = sequence.toString().padStart(4, '0');
  return `LH-${year}-${paddedSeq}`;
};
