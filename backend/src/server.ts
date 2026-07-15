// src/server.ts
import dotenv from 'dotenv';
dotenv.config();

import app from './app';
import logger from './utils/logger';
import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient();

const PORT = process.env.PORT || 3000;
const SHUTDOWN_TIMEOUT_MS = 10_000;

async function startServer() {
  try {
    // 1. Test DB connection
    await prisma.$connect();
    logger.info('Connected to PostgreSQL Database via Prisma');

    // 2. Start CRON Jobs
    const { startReminderJob } = await import('./jobs/reminderJob');
    const reminderTask = startReminderJob();
    logger.info('Cron jobs initialized');

    // 3. Start Server
    const server = app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT} in ${process.env.NODE_ENV} environment`);
    });

    // Graceful Shutdown
    let isShuttingDown = false;

    const exitHandler = async (signal: string) => {
      if (isShuttingDown) return;
      isShuttingDown = true;
      logger.info(`Received ${signal}. Shutting down gracefully...`);
      reminderTask?.stop();

      const forceExit = setTimeout(() => {
        logger.error('Shutdown timeout exceeded, forcing exit');
        process.exit(1);
      }, SHUTDOWN_TIMEOUT_MS);

      server.close(async () => {
        clearTimeout(forceExit);
        await prisma.$disconnect();
        logger.info('Closed DB connection.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => exitHandler('SIGTERM'));
    process.on('SIGINT', () => exitHandler('SIGINT'));
    process.on('SIGQUIT', () => exitHandler('SIGQUIT'));

  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
