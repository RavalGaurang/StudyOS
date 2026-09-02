import express, { Express, Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import swaggerUi from 'swagger-ui-express';
import { env } from './config/env.config';
import { logger } from './config/logger';
import { apiLimiter } from './middleware/rateLimiter.middleware';
import { errorHandler } from './middleware/errorHandler.middleware';
import { v1Routes } from './routes';
import { swaggerDocument } from './config/swagger';
import { sendSuccess } from './common/utils/responseFormatter';
import { NotFoundError } from './common/errors/AppError';

export function createApp(): Express {
  const app = express();

  // 1. Security Headers
  app.use(helmet());

  // 2. CORS
  app.use(
    cors({
      origin: [env.FRONTEND_URL, 'http://localhost:3000', 'http://127.0.0.1:3000'],
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    })
  );

  // 3. Body & Cookie Parsing
  app.use(cookieParser());
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // 4. Request Logging
  app.use((req: Request, res: Response, next: NextFunction) => {
    const start = Date.now();
    res.on('finish', () => {
      const duration = Date.now() - start;
      logger.info(`${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`);
    });
    next();
  });

  // 5. Global Rate Limiter
  app.use('/api/', apiLimiter);

  // 6. Swagger API Documentation (Available in dev/staging)
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

  // 7. Health Check
  const healthCheckHandler = (req: Request, res: Response) => {
    return sendSuccess(res, 'StudyOS API is healthy and operational', {
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: env.NODE_ENV,
      version: '1.0.0',
    });
  };

  app.get('/health', healthCheckHandler);
  app.get('/api/v1/health', healthCheckHandler);

  // 8. API v1 Mount Point
  app.use('/api/v1', v1Routes);

  // 9. Unhandled 404 Route Catch
  app.use((req: Request, res: Response, next: NextFunction) => {
    next(new NotFoundError(`Endpoint not found: ${req.method} ${req.originalUrl}`));
  });

  // 10. Centralized Global Error Handler
  app.use(errorHandler);

  return app;
}
