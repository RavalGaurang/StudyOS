import rateLimit from 'express-rate-limit';
import { TooManyRequestsError } from '../common/errors/AppError';

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // max 20 requests per IP per window
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next) => {
    next(new TooManyRequestsError('Too many authentication attempts. Please try again in 15 minutes.'));
  },
});

export const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 300, // max 300 requests per IP per minute
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next) => {
    next(new TooManyRequestsError('API rate limit exceeded. Please slow down your requests.'));
  },
});
