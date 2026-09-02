import { Response } from 'express';
import { ValidationErrorDetail } from '../errors/AppError';

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  meta?: PaginationMeta;
  errors?: ValidationErrorDetail[];
}

export function sendSuccess<T>(
  res: Response,
  message: string,
  data?: T,
  meta?: PaginationMeta,
  statusCode: number = 200
): Response {
  const payload: ApiResponse<T> = {
    success: true,
    message,
    ...(data !== undefined && { data }),
    ...(meta !== undefined && { meta }),
  };
  return res.status(statusCode).json(payload);
}

export function sendError(
  res: Response,
  message: string,
  statusCode: number = 500,
  errors?: ValidationErrorDetail[]
): Response {
  const payload: ApiResponse = {
    success: false,
    message,
    ...(errors && errors.length > 0 && { errors }),
  };
  return res.status(statusCode).json(payload);
}
