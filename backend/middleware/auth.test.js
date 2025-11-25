/**
 * Authentication Middleware Tests
 * Tests for token verification middleware
 */

import { describe, it, expect, vi } from 'vitest';
import * as fc from 'fast-check';
import { authenticateToken, optionalAuth } from './auth.js';
import { generateToken } from '../services/auth.js';

describe('Authentication Middleware', () => {
  describe('Property-Based Tests', () => {
    /**
     * Feature: multi-user-auth, Property 10: Unauthorized request rejection
     * Validates: Requirements 7.2, 7.3
     * 
     * For any API request to protected endpoints without a valid token, 
     * the backend should reject the request with a 401 status code.
     */
    it('should reject all requests without valid tokens with 401', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.oneof(
            fc.constant(undefined), // No header
            fc.constant(''), // Empty header
            fc.constant('InvalidToken'), // Invalid format
            fc.string().filter(s => !s.startsWith('Bearer ')), // Wrong prefix
            fc.string().map(s => `Bearer ${s}`), // Bearer with invalid token
            fc.constant('Bearer '), // Bearer with no token
          ),
          async (authHeader) => {
            const req = {
              headers: {
                authorization: authHeader
              }
            };
            
            const res = {
              status: vi.fn().mockReturnThis(),
              json: vi.fn().mockReturnThis()
            };
            
            const next = vi.fn();
            
            authenticateToken(req, res, next);
            
            // Should return 401 status
            expect(res.status).toHaveBeenCalledWith(401);
            
            // Should return error in JSON
            expect(res.json).toHaveBeenCalled();
            const jsonCall = res.json.mock.calls[0][0];
            expect(jsonCall).toHaveProperty('error');
            
            // Should NOT call next()
            expect(next).not.toHaveBeenCalled();
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Unit Tests', () => {
    it('should accept valid tokens', () => {
      const token = generateToken({
        userId: '123e4567-e89b-12d3-a456-426614174000',
        email: 'test@example.com'
      });
      
      const req = {
        headers: {
          authorization: `Bearer ${token}`
        }
      };
      
      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn().mockReturnThis()
      };
      
      const next = vi.fn();
      
      authenticateToken(req, res, next);
      
      expect(next).toHaveBeenCalled();
      expect(req.user).toBeDefined();
      expect(req.user.userId).toBe('123e4567-e89b-12d3-a456-426614174000');
      expect(req.user.email).toBe('test@example.com');
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should reject requests with no authorization header', () => {
      const req = {
        headers: {}
      };
      
      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn().mockReturnThis()
      };
      
      const next = vi.fn();
      
      authenticateToken(req, res, next);
      
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Authentication required',
        message: 'No token provided'
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should reject requests with invalid token format', () => {
      const req = {
        headers: {
          authorization: 'InvalidToken'
        }
      };
      
      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn().mockReturnThis()
      };
      
      const next = vi.fn();
      
      authenticateToken(req, res, next);
      
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Authentication required',
        message: 'No token provided'
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should reject requests with invalid JWT token', () => {
      const req = {
        headers: {
          authorization: 'Bearer invalid.jwt.token'
        }
      };
      
      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn().mockReturnThis()
      };
      
      const next = vi.fn();
      
      authenticateToken(req, res, next);
      
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalled();
      const jsonCall = res.json.mock.calls[0][0];
      expect(jsonCall.error).toBeDefined();
      expect(next).not.toHaveBeenCalled();
    });

    it('should handle expired tokens', () => {
      // Create a token that's already expired
      const expiredToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxMjMiLCJlbWFpbCI6InRlc3RAZXhhbXBsZS5jb20iLCJpYXQiOjE1MTYyMzkwMjIsImV4cCI6MTUxNjIzOTAyMn0.invalid';
      
      const req = {
        headers: {
          authorization: `Bearer ${expiredToken}`
        }
      };
      
      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn().mockReturnThis()
      };
      
      const next = vi.fn();
      
      authenticateToken(req, res, next);
      
      expect(res.status).toHaveBeenCalledWith(401);
      expect(next).not.toHaveBeenCalled();
    });

    describe('optionalAuth middleware', () => {
      it('should attach user info when valid token provided', () => {
        const token = generateToken({
          userId: '123e4567-e89b-12d3-a456-426614174000',
          email: 'test@example.com'
        });
        
        const req = {
          headers: {
            authorization: `Bearer ${token}`
          }
        };
        
        const res = {};
        const next = vi.fn();
        
        optionalAuth(req, res, next);
        
        expect(next).toHaveBeenCalled();
        expect(req.user).toBeDefined();
        expect(req.user.userId).toBe('123e4567-e89b-12d3-a456-426614174000');
      });

      it('should continue without user info when no token provided', () => {
        const req = {
          headers: {}
        };
        
        const res = {};
        const next = vi.fn();
        
        optionalAuth(req, res, next);
        
        expect(next).toHaveBeenCalled();
        expect(req.user).toBeUndefined();
      });

      it('should continue without user info when invalid token provided', () => {
        const req = {
          headers: {
            authorization: 'Bearer invalid.token'
          }
        };
        
        const res = {};
        const next = vi.fn();
        
        optionalAuth(req, res, next);
        
        expect(next).toHaveBeenCalled();
        expect(req.user).toBeUndefined();
      });
    });
  });
});
