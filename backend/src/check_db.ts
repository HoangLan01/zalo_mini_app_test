import { PrismaClient } from '@prisma/client';
import logger from './utils/logger';

const prisma = new PrismaClient();

async function check() {
  try {
    const token = await prisma.oAToken.findUnique({ where: { id: 'default' } });
    logger.info(`OAToken in DB: ${token ? 'Found' : 'Not Found'}`);
    if (token) {
      logger.info(`Token expires at: ${token.expiresAt.toISOString()}`);
    }
  } catch (err: any) {
    logger.error(`Error checking DB: ${err.message}`);
  } finally {
    await prisma.$disconnect();
  }
}

check();
