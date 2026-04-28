// src/server.ts
import dotenv from 'dotenv';
dotenv.config();

import app from './app';
import logger from './utils/logger';
import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient();

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    // 1. Test DB connection
    await prisma.$connect();
    logger.info('Connected to PostgreSQL Database via Prisma');

    // 2. Start CRON Jobs
    import('./jobs/reminderJob').then(({ startReminderJob }) => {
      startReminderJob();
    });
    import('./jobs/syncNews.job').then(({ startSyncNewsJob }) => {
      startSyncNewsJob();
    });
    logger.info('Cron jobs initialized');

    // 3. Start Server
    const server = app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT} in ${process.env.NODE_ENV} environment`);
    });

    // Graceful Shutdown
    const exitHandler = async () => {
      logger.info('Shutting down server gracefully...');
      server.close(async () => {
        await prisma.$disconnect();
        logger.info('Closed DB connection.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', exitHandler);
    process.on('SIGINT', exitHandler);

  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
