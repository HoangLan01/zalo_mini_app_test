const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkTokens() {
  try {
    const tokens = await prisma.oAToken.findMany();
    console.log('Current OA Tokens in Database:');
    tokens.forEach(t => {
      console.log(`ID: ${t.id}`);
      console.log(`Access Token (start): ${t.accessToken.substring(0, 20)}...`);
      console.log(`Refresh Token (start): ${t.refreshToken.substring(0, 20)}...`);
      console.log(`Expires At: ${t.expiresAt}`);
      console.log(`Is Expired: ${t.expiresAt < new Date()}`);
      console.log('---');
    });
    
    const envToken = process.env.ZALO_OA_ACCESS_TOKEN;
    if (envToken) {
      console.log(`Env Access Token (start): ${envToken.substring(0, 20)}...`);
    } else {
      console.log('Env Access Token is NOT set.');
    }

  } catch (error) {
    console.error('Error checking tokens:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkTokens();
