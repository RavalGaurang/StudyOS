export interface ValidationErrorDetail {
  field: string;
  message: string;
}

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly errors?: ValidationErrorDetail[];

  constructor(message: string, statusCode: number = 500, errors?: ValidationErrorDetail[]) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    this.errors = errors;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class BadRequestError extends AppError {
  constructor(message: string = 'Bad Request', errors?: ValidationErrorDetail[]) {
    super(message, 400, errors);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized access') {
    super(message, 401);
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = 'Forbidden - Insufficient permissions') {
    super(message, 403);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found') {
    super(message, 404);
  }
}

export class ConflictError extends AppError {
  constructor(message: string = 'Conflict - Resource already exists') {
    super(message, 409);
  }
}

export class ValidationError extends AppError {
  constructor(message: string = 'Validation failed', errors?: ValidationErrorDetail[]) {
    super(message, 422, errors);
  }
}

export class TooManyRequestsError extends AppError {
  constructor(message: string = 'Too many requests - Please try again later') {
    super(message, 429);
  }
}
