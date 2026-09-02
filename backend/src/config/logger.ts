import winston from 'winston';
import { env } from './env.config';

const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  env.NODE_ENV === 'development'
    ? winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(({ timestamp, level, message, stack, ...meta }) => {
          const metaString = Object.keys(meta).length ? `\n${JSON.stringify(meta, null, 2)}` : '';
          return `[${timestamp}] ${level}: ${message}${stack ? `\n${stack}` : ''}${metaString}`;
        })
      )
    : winston.format.json()
);

export const logger = winston.createLogger({
  level: env.NODE_ENV === 'development' ? 'debug' : 'info',
  format: logFormat,
  transports: [
    new winston.transports.Console(),
  ],
});
