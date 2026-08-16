import { PrismaClient } from '@prisma/client';

const prisma = process.env.DATABASE_URL ? new PrismaClient() : null;

// Graceful shutdown
if (prisma) {
  process.on('SIGINT', async () => {
    await prisma.$disconnect();
    process.exit();
  });

  process.on('SIGTERM', async () => {
    await prisma.$disconnect();
    process.exit();
  });
}

export default prisma;

