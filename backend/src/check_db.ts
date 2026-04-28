import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function check() {
  try {
    const token = await prisma.oAToken.findUnique({ where: { id: 'default' } });
    console.log('OAToken in DB:', token ? 'Found' : 'Not Found');
    if (token) {
       console.log('Token expires at:', token.expiresAt);
    }
    
    const articleCount = await prisma.article.count();
    console.log('Article count in DB:', articleCount);
  } catch (err: any) {
    console.error('Error checking DB:', err.message);
  } finally {
    await prisma.$disconnect();
  }
}

check();
