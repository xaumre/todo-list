/**
 * Input Validation Middleware
 * Provides validation functions for request data
 */

/**
 * Email validation regex
 * Basic email format validation
 */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Minimum password length
 */
const MIN_PASSWORD_LENGTH = 8;

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid
 */
export function isValidEmail(email) {
  return typeof email === 'string' && EMAIL_REGEX.test(email);
}

/**
 * Validate password requirements
 * @param {string} password - Password to validate
 * @returns {boolean} True if valid
 */
export function isValidPassword(password) {
  return typeof password === 'string' && 
         password.length >= MIN_PASSWORD_LENGTH &&
         password.trim().length >= MIN_PASSWORD_LENGTH;
}

/**
 * Middleware to validate registration input
 * @param {import('express').Request} req - Express request
 * @param {import('express').Response} res - Express response
 * @param {import('express').NextFunction} next - Express next function
 */
export function validateRegistration(req, res, next) {
  const { email, password } = req.body;

  // Validate required fields
  if (!email || !password) {
    return res.status(400).json({
      error: 'Email and password are required'
    });
  }

  // Validate email format
  if (!isValidEmail(email)) {
    return res.status(400).json({
      error: 'Invalid email format'
    });
  }

  // Validate password length
  if (!isValidPassword(password)) {
    return res.status(400).json({
      error: `Password must be at least ${MIN_PASSWORD_LENGTH} characters`
    });
  }

  next();
}

/**
 * Middleware to validate login input
 * @param {import('express').Request} req - Express request
 * @param {import('express').Response} res - Express response
 * @param {import('express').NextFunction} next - Express next function
 */
export function validateLogin(req, res, next) {
  const { email, password } = req.body;

  // Validate required fields
  if (!email || !password) {
    return res.status(400).json({
      error: 'Email and password are required'
    });
  }

  next();
}

/**
 * Middleware to validate task creation input
 * @param {import('express').Request} req - Express request
 * @param {import('express').Response} res - Express response
 * @param {import('express').NextFunction} next - Express next function
 */
export function validateTaskCreation(req, res, next) {
  const { description } = req.body;

  // Validate description
  if (!description) {
    return res.status(400).json({
      error: 'Task description is required'
    });
  }

  if (typeof description !== 'string' || description.trim().length === 0) {
    return res.status(400).json({
      error: 'Task description must be a non-empty string'
    });
  }

  next();
}

/**
 * Middleware to validate task update input
 * @param {import('express').Request} req - Express request
 * @param {import('express').Response} res - Express response
 * @param {import('express').NextFunction} next - Express next function
 */
export function validateTaskUpdate(req, res, next) {
  const { description, completed } = req.body;

  // At least one field must be provided
  if (description === undefined && completed === undefined) {
    return res.status(400).json({
      error: 'No valid updates provided'
    });
  }

  // Validate description if provided
  if (description !== undefined) {
    if (typeof description !== 'string' || description.trim().length === 0) {
      return res.status(400).json({
        error: 'Task description must be a non-empty string'
      });
    }
  }

  // Validate completed if provided
  if (completed !== undefined) {
    if (typeof completed !== 'boolean') {
      return res.status(400).json({
        error: 'Completed status must be a boolean'
      });
    }
  }

  next();
}
