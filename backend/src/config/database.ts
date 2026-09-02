import { PrismaClient } from '@prisma/client';
import { logger } from './logger';
import { env } from './env.config';

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

export const prisma =
  global.prisma ||
  new PrismaClient({
    log:
      env.NODE_ENV === 'development'
        ? [
            { emit: 'event', level: 'query' },
            { emit: 'stdout', level: 'error' },
            { emit: 'stdout', level: 'warn' },
          ]
        : ['error'],
  });

if (env.NODE_ENV === 'development') {
  global.prisma = prisma;
  
  // @ts-ignore
  prisma.$on('query', (e: any) => {
    logger.debug(`Prisma Query: ${e.query} - Params: ${e.params} - Duration: ${e.duration}ms`);
  });
}

export async function connectDatabase() {
  try {
    await prisma.$connect();
    logger.info('📦 PostgreSQL Database connected successfully via Prisma');
  } catch (error) {
    logger.error('❌ Failed to connect to database:', error);
    // Don't crash immediately in dev if DB is starting
    if (env.NODE_ENV === 'production') {
      process.exit(1);
    }
  }
}
