/**
 * Authentication Controller
 * Handles authentication endpoints: register, login, getCurrentUser
 */

import { hashPassword, generateToken, verifyPassword } from '../services/auth.js';
import { createUser, findUserByEmail, findUserById } from '../services/database.js';

/**
 * Register a new user
 * POST /api/auth/register
 * @param {import('express').Request} req - Express request
 * @param {import('express').Response} res - Express response
 * @param {import('express').NextFunction} next - Express next function
 */
export async function register(req, res, next) {
  try {
    const { email, password } = req.body;

    // Validate password length (in case validation middleware is bypassed in tests)
    if (!password || password.length < 8) {
      return res.status(400).json({
        error: 'Password must be at least 8 characters'
      });
    }

    // Check if user already exists
    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({
        error: 'An account with this email already exists'
      });
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user
    const user = await createUser(email, passwordHash);

    // Generate JWT token
    const token = generateToken({
      userId: user.id,
      email: user.email
    });

    // Return token and user data (without password hash)
    return res.status(201).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        created_at: user.created_at
      }
    });
  } catch (error) {
    // Pass error to global error handler
    next(error);
  }
}

/**
 * Login an existing user
 * POST /api/auth/login
 * @param {import('express').Request} req - Express request
 * @param {import('express').Response} res - Express response
 * @param {import('express').NextFunction} next - Express next function
 */
export async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(401).json({
        error: 'Invalid email or password'
      });
    }

    // Verify password
    const isValidPassword = await verifyPassword(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({
        error: 'Invalid email or password'
      });
    }

    // Generate JWT token
    const token = generateToken({
      userId: user.id,
      email: user.email
    });

    // Return token and user data (without password hash)
    return res.status(200).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        created_at: user.created_at
      }
    });
  } catch (error) {
    // Pass error to global error handler
    next(error);
  }
}

/**
 * Get current authenticated user
 * GET /api/auth/me
 * @param {import('express').Request & { userId?: string }} req - Express request
 * @param {import('express').Response} res - Express response
 * @param {import('express').NextFunction} next - Express next function
 */
export async function getCurrentUser(req, res, next) {
  try {
    // User ID is attached to req by authenticateToken middleware
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({
        error: 'Authentication required'
      });
    }

    // Find user by ID
    const user = await findUserById(userId);
    if (!user) {
      return res.status(404).json({
        error: 'User not found'
      });
    }

    // Return user data (without password hash)
    return res.status(200).json({
      user: {
        id: user.id,
        email: user.email,
        created_at: user.created_at
      }
    });
  } catch (error) {
    // Pass error to global error handler
    next(error);
  }
}

