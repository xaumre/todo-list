/**
 * Global Error Handler Middleware
 * Catches and formats errors, provides user-friendly messages
 */

import config from '../config/env.js';

/**
 * Custom error class for application errors
 */
export class AppError extends Error {
  /**
   * @param {string} message - Error message
   * @param {number} statusCode - HTTP status code
   */
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Database error handler
 * Converts database errors to user-friendly messages
 * @param {Error} error - Database error
 * @returns {{ statusCode: number, message: string }} Formatted error
 */
function handleDatabaseError(error) {
  // PostgreSQL error codes
  const pgErrorCodes = {
    '23505': { status: 409, message: 'A record with this value already exists' },
    '23503': { status: 400, message: 'Referenced record does not exist' },
    '23502': { status: 400, message: 'Required field is missing' },
    '22P02': { status: 400, message: 'Invalid data format' },
    '42P01': { status: 500, message: 'Database table not found' },
    '42703': { status: 500, message: 'Database column not found' },
    '08006': { status: 503, message: 'Database connection failed' },
    '08003': { status: 503, message: 'Database connection does not exist' },
    '08000': { status: 503, message: 'Database connection error' }
  };

  // Check if it's a PostgreSQL error
  if (error.code && pgErrorCodes[error.code]) {
    return pgErrorCodes[error.code];
  }

  // Check for connection errors
  if (error.message && error.message.includes('connect')) {
    return { status: 503, message: 'Unable to connect to database. Please try again later.' };
  }

  // Default database error
  return { status: 500, message: 'A database error occurred' };
}

/**
 * JWT error handler
 * Converts JWT errors to user-friendly messages
 * @param {Error} error - JWT error
 * @returns {{ statusCode: number, message: string }} Formatted error
 */
function handleJWTError(error) {
  if (error.name === 'JsonWebTokenError') {
    return { status: 401, message: 'Invalid authentication token' };
  }
  if (error.name === 'TokenExpiredError') {
    return { status: 401, message: 'Your session has expired. Please log in again.' };
  }
  return { status: 401, message: 'Authentication error' };
}

/**
 * Global error handler middleware
 * @param {Error & { statusCode?: number, isOperational?: boolean }} err - Error object
 * @param {import('express').Request} req - Express request
 * @param {import('express').Response} res - Express response
 * @param {import('express').NextFunction} next - Express next function
 */
export function errorHandler(err, req, res, next) {
  // Log error for debugging
  console.error('Error occurred:', {
    message: err.message,
    stack: config.nodeEnv === 'development' ? err.stack : undefined,
    path: req.path,
    method: req.method,
    timestamp: new Date().toISOString()
  });

  // Default error values
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal server error';

  // Handle specific error types
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    const jwtError = handleJWTError(err);
    statusCode = jwtError.status;
    message = jwtError.message;
  } else if (err.code || (err.message && err.message.includes('database'))) {
    // Database errors
    const dbError = handleDatabaseError(err);
    statusCode = dbError.status;
    message = dbError.message;
  } else if (err.name === 'ValidationError') {
    // Validation errors
    statusCode = 400;
    message = err.message || 'Validation error';
  } else if (err.name === 'SyntaxError' && err.message.includes('JSON')) {
    // JSON parsing errors
    statusCode = 400;
    message = 'Invalid JSON in request body';
  }

  // Don't expose internal errors in production
  if (statusCode === 500 && config.nodeEnv === 'production' && !err.isOperational) {
    message = 'An unexpected error occurred. Please try again later.';
  }

  // Send error response
  const errorResponse = {
    error: message,
    ...(config.nodeEnv === 'development' && {
      stack: err.stack,
      details: err
    })
  };

  res.status(statusCode).json(errorResponse);
}

/**
 * Async handler wrapper
 * Wraps async route handlers to catch errors
 * @param {Function} fn - Async function to wrap
 * @returns {Function} Wrapped function
 */
export function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
