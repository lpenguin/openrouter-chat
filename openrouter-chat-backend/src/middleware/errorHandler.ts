import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

// Custom error class for API errors
export class ApiError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode: number = 500, isOperational: boolean = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    
    // Maintains proper stack trace for where error was thrown
    Error.captureStackTrace(this, this.constructor);
  }
}

// Standard error response format
interface ErrorResponse {
  error: string;
  statusCode: number;
  timestamp: string;
  path?: string;
  details?: any;
}

// Global error handling middleware
export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let statusCode = 500;
  let message = 'Internal Server Error';
  let details: any = undefined;

  // Handle different types of errors
  if (error instanceof ApiError) {
    statusCode = error.statusCode;
    message = error.message;
  } else if (error instanceof z.ZodError) {
    // Handle Zod validation errors
    statusCode = 400;
    message = 'Validation Error';
    details = error.errors.map(err => ({
      field: err.path.join('.'),
      message: err.message,
    }));
  } else if (error.name === 'ValidationError') {
    // Handle other validation errors
    statusCode = 400;
    message = error.message;
  } else if (error.name === 'UnauthorizedError' || error.message.includes('Unauthorized')) {
    statusCode = 401;
    message = 'Unauthorized';
  } else if (error.message.includes('not found') || error.message.includes('Not found')) {
    statusCode = 404;
    message = error.message;
  } else if (error.message.includes('Forbidden') || error.message.includes('forbidden')) {
    statusCode = 403;
    message = error.message;
  } else {
    // Log unexpected errors
    console.error('Unexpected error:', error);
    message = process.env.NODE_ENV === 'production' ? 'Internal Server Error' : error.message;
  }

  const errorResponse: ErrorResponse = {
    error: message,
    statusCode,
    timestamp: new Date().toISOString(),
    path: req.path,
  };

  if (details) {
    errorResponse.details = details;
  }

  // Set status code and send JSON response
  res.status(statusCode).json(errorResponse);
};

// 404 handler for unmatched routes
export const notFoundHandler = (req: Request, res: Response, next: NextFunction): void => {
  const error = new ApiError(`Route ${req.method} ${req.path} not found`, 404);
  next(error);
};
