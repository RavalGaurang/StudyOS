import { createApp } from './app';
import { env } from './config/env.config';
import { logger } from './config/logger';
import { connectDatabase, prisma } from './config/database';

async function bootstrap() {
  await connectDatabase();

  const app = createApp();
  const server = app.listen(env.PORT, () => {
    logger.info(`🚀 StudyOS Server is running at http://localhost:${env.PORT}`);
    logger.info(`📚 Swagger Documentation available at http://localhost:${env.PORT}/api/docs`);
    logger.info(`✨ Environment: ${env.NODE_ENV}`);
  });

  // Graceful shutdown handling
  const shutdown = async (signal: string) => {
    logger.info(`🛑 Received ${signal}. Shutting down gracefully...`);
    server.close(async () => {
      await prisma.$disconnect();
      logger.info('📦 Prisma disconnected. Process exiting.');
      process.exit(0);
    });

    // Force exit after 10s if dangling connections remain
    setTimeout(() => {
      logger.error('⚠️ Forcefully terminating after timeout');
      process.exit(1);
    }, 10000);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

bootstrap().catch((err) => {
  logger.error('❌ Fatal error during bootstrap:', err);
  process.exit(1);
});
