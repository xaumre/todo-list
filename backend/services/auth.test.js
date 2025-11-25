/**
 * Authentication Service Tests
 * Tests for password hashing, JWT generation, and token verification
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import {
  hashPassword,
  verifyPassword,
  generateToken,
  verifyToken,
  extractTokenFromHeader
} from './auth.js';

describe('Authentication Service', () => {
  describe('Property-Based Tests', () => {
    /**
     * Feature: multi-user-auth, Property 11: Password hashing security
     * Validates: Requirements 7.4
     * 
     * For any user password stored in the database, the stored value should be 
     * a bcrypt hash, not the plaintext password.
     */
    it('should never store plaintext passwords - hashed passwords should not equal original', { timeout: 30000 }, async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 1, maxLength: 100 }),
          async (password) => {
            const hash = await hashPassword(password);
            
            // Hash should not equal the original password
            expect(hash).not.toBe(password);
            
            // Hash should be a bcrypt hash (starts with $2b$ or $2a$)
            expect(hash).toMatch(/^\$2[ab]\$/);
            
            // Hash should be significantly longer than typical passwords
            expect(hash.length).toBeGreaterThan(50);
            
            // The hash should verify against the original password
            const isValid = await verifyPassword(password, hash);
            expect(isValid).toBe(true);
          }
        ),
        { numRuns: 20 }
      );
    });
  });

  describe('Unit Tests', () => {
    it('should hash passwords correctly', async () => {
      const password = 'testPassword123';
      const hash = await hashPassword(password);
      
      expect(hash).toBeDefined();
      expect(hash).not.toBe(password);
      expect(hash).toMatch(/^\$2[ab]\$/);
    });

    it('should verify correct passwords', async () => {
      const password = 'testPassword123';
      const hash = await hashPassword(password);
      const isValid = await verifyPassword(password, hash);
      
      expect(isValid).toBe(true);
    });

    it('should reject incorrect passwords', async () => {
      const password = 'testPassword123';
      const wrongPassword = 'wrongPassword456';
      const hash = await hashPassword(password);
      const isValid = await verifyPassword(wrongPassword, hash);
      
      expect(isValid).toBe(false);
    });

    it('should generate valid JWT tokens', () => {
      const payload = {
        userId: '123e4567-e89b-12d3-a456-426614174000',
        email: 'test@example.com'
      };
      
      const token = generateToken(payload);
      
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.').length).toBe(3); // JWT has 3 parts
    });

    it('should verify and decode valid tokens', () => {
      const payload = {
        userId: '123e4567-e89b-12d3-a456-426614174000',
        email: 'test@example.com'
      };
      
      const token = generateToken(payload);
      const decoded = verifyToken(token);
      
      expect(decoded.userId).toBe(payload.userId);
      expect(decoded.email).toBe(payload.email);
      expect(decoded.iat).toBeDefined();
      expect(decoded.exp).toBeDefined();
    });

    it('should throw error for invalid tokens', () => {
      const invalidToken = 'invalid.token.here';
      
      expect(() => verifyToken(invalidToken)).toThrow();
    });

    it('should handle token expiration', async () => {
      // Create a token with very short expiration (1 second)
      const jwt = await import('jsonwebtoken');
      const config = await import('../config/env.js');
      
      const payload = {
        userId: '123e4567-e89b-12d3-a456-426614174000',
        email: 'test@example.com'
      };
      
      const shortLivedToken = jwt.default.sign(
        payload,
        config.default.jwtSecret,
        { expiresIn: '1s' }
      );
      
      // Token should be valid immediately
      const decoded = verifyToken(shortLivedToken);
      expect(decoded.userId).toBe(payload.userId);
      
      // Wait for token to expire
      await new Promise(resolve => setTimeout(resolve, 1100));
      
      // Token should now be expired
      expect(() => verifyToken(shortLivedToken)).toThrow();
    });

    it('should extract token from Bearer header', () => {
      const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test';
      const authHeader = `Bearer ${token}`;
      
      const extracted = extractTokenFromHeader(authHeader);
      
      expect(extracted).toBe(token);
    });

    it('should return null for missing Bearer prefix', () => {
      const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test';
      
      const extracted = extractTokenFromHeader(token);
      
      expect(extracted).toBeNull();
    });

    it('should return null for empty header', () => {
      const extracted = extractTokenFromHeader('');
      
      expect(extracted).toBeNull();
    });

    it('should return null for null header', () => {
      const extracted = extractTokenFromHeader(null);
      
      expect(extracted).toBeNull();
    });
  });
});
