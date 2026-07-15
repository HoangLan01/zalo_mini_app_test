import dotenv from 'dotenv';
dotenv.config();

import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import { isStrongPassword, PASSWORD_POLICY_MESSAGE } from './utils/password';
import logger from './utils/logger';

const prisma = new PrismaClient();

async function main() {
  const email = process.env.SUPER_ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.SUPER_ADMIN_INITIAL_PASSWORD;
  const displayName = process.env.SUPER_ADMIN_DISPLAY_NAME?.trim() || 'Super Admin';

  if (!email) throw new Error('SUPER_ADMIN_EMAIL is required');

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    await prisma.user.update({
      where: { id: existing.id },
      data: { role: 'SUPER_ADMIN', status: 'ACTIVE', sessionVersion: { increment: 1 } }
    });
    logger.info(`Promoted ${email} to SUPER_ADMIN without changing its password.`);
    return;
  }

  if (!password) throw new Error('SUPER_ADMIN_INITIAL_PASSWORD is required when creating a new account');
  if (!isStrongPassword(password)) throw new Error(PASSWORD_POLICY_MESSAGE);

  await prisma.user.create({
    data: {
      email,
      displayName,
      passwordHash: await bcrypt.hash(password, 12),
      role: 'SUPER_ADMIN',
      status: 'ACTIVE',
      mustChangePassword: true
    }
  });
  logger.info(`Created SUPER_ADMIN ${email}. Password change is required on first login.`);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async error => {
    logger.error(`Failed to bootstrap SUPER_ADMIN: ${error instanceof Error ? error.stack || error.message : String(error)}`);
    await prisma.$disconnect();
    process.exit(1);
  });
