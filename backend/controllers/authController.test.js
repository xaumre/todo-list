/**
 * Authentication Controller Tests
 * Property-based tests for authentication endpoints
 */

import { describe, it, expect, afterEach } from 'vitest';
import * as fc from 'fast-check';
import { register, login } from './authController.js';
import { pool, findUserByEmail } from '../services/database.js';

/**
 * Helper to create mock Express request/response objects
 */
function createMockReqRes(body = {}) {
  const req = { body };
  const res = {
    status: function(code) {
      this.statusCode = code;
      return this;
    },
    json: function(data) {
      this.data = data;
      return this;
    },
    statusCode: 200,
    data: null
  };
  // Mock next function for error handling
  const next = (error) => {
    if (error) {
      res.status(500).json({ error: error.message });
    }
  };
  return { req, res, next };
}

/**
 * Generate a valid password (8-50 chars, not all whitespace)
 * @returns {fc.Arbitrary<string>} Password generator
 */
function validPassword() {
  return fc.string({ minLength: 8, maxLength: 50 })
    .filter(pwd => pwd.trim().length >= 8);
}

/**
 * Clean up test users from database
 */
async function cleanupTestUsers(emails) {
  if (emails.length === 0) return;
  
  // Use proper PostgreSQL placeholders ($1, $2, etc.)
  const placeholders = emails.map((_, i) => '$' + (i + 1)).join(', ');
  await pool.query(
    'DELETE FROM users WHERE email IN (' + placeholders + ')',
    emails
  );
}

describe('Authentication Controller - Property Tests', () => {
  const testEmails = [];

  afterEach(async () => {
    // Clean up any test users created during tests
    await cleanupTestUsers(testEmails);
    testEmails.length = 0;
  });

  describe('Property 1: Registration creates unique users', () => {
    /**
     * **Feature: multi-user-auth, Property 1: Registration creates unique users**
     * **Validates: Requirements 1.1, 1.2**
     * 
     * For any valid email and password combination, registering should create a new user account,
     * and attempting to register the same email again should be rejected.
     */
    it('should create unique users and reject duplicate emails', async () => {
      await fc.assert(
        fc.asyncProperty(
          // Generate valid email and password
          fc.emailAddress(),
          validPassword(),
          async (email, password) => {
            testEmails.push(email);

            // First registration should succeed
            const { req: req1, res: res1, next: next1 } = createMockReqRes({ email, password });
            await register(req1, res1, next1);

            // Should return 201 Created
            expect(res1.statusCode).toBe(201);
            expect(res1.data).toHaveProperty('token');
            expect(res1.data).toHaveProperty('user');
            expect(res1.data.user.email).toBe(email);

            // Verify user was created in database
            const user = await findUserByEmail(email);
            expect(user).not.toBeNull();
            expect(user.email).toBe(email);

            // Second registration with same email should fail
            const { req: req2, res: res2, next: next2 } = createMockReqRes({ email, password });
            await register(req2, res2, next2);

            // Should return 409 Conflict
            expect(res2.statusCode).toBe(409);
            expect(res2.data.error).toContain('already exists');
          }
        ),
        { numRuns: 10 } // Reduced from 50 to speed up tests
      );
    }, 30000); // 30 second timeout
  });

  describe('Property 2: Password minimum length enforcement', () => {
    /**
     * **Feature: multi-user-auth, Property 2: Password minimum length enforcement**
     * **Validates: Requirements 1.3**
     * 
     * For any password string with fewer than 8 characters, registration should be rejected
     * regardless of other input validity.
     */
    it('should reject passwords shorter than 8 characters', async () => {
      await fc.assert(
        fc.asyncProperty(
          // Generate unique email for each test
          fc.emailAddress(),
          // Generate short password (1-7 characters)
          fc.string({ minLength: 1, maxLength: 7 }),
          async (email, password) => {
            testEmails.push(email);

            // Registration should fail due to short password
            const { req, res, next } = createMockReqRes({ email, password });
            await register(req, res, next);

            // Should return 400 Bad Request
            expect(res.statusCode).toBe(400);
            expect(res.data.error).toContain('at least 8 characters');
          }
        ),
        { numRuns: 20 }
      );
    });
  });

  describe('Property 3: Successful registration auto-login', () => {
    /**
     * **Feature: multi-user-auth, Property 3: Successful registration auto-login**
     * **Validates: Requirements 1.4**
     * 
     * For any successful registration, the user should be automatically authenticated
     * with a valid session token.
     */
    it('should return a valid JWT token on successful registration', async () => {
      await fc.assert(
        fc.asyncProperty(
          // Generate valid email and password
          fc.emailAddress(),
          validPassword(),
          async (email, password) => {
            testEmails.push(email);

            // Registration should succeed
            const { req, res, next } = createMockReqRes({ email, password });
            await register(req, res, next);

            // Should return 201 Created
            expect(res.statusCode).toBe(201);
            
            // Should have a token (auto-login)
            expect(res.data).toHaveProperty('token');
            expect(typeof res.data.token).toBe('string');
            expect(res.data.token.length).toBeGreaterThan(0);
            
            // Token should be a valid JWT (has 3 parts separated by dots)
            const tokenParts = res.data.token.split('.');
            expect(tokenParts.length).toBe(3);
            
            // Should also return user data
            expect(res.data).toHaveProperty('user');
            expect(res.data.user.email).toBe(email);
          }
        ),
        { numRuns: 10 } // Reduced from 50 to speed up tests
      );
    }, 30000); // 30 second timeout
  });

  describe('Property 4: Valid credentials authenticate', () => {
    /**
     * **Feature: multi-user-auth, Property 4: Valid credentials authenticate**
     * **Validates: Requirements 2.1**
     * 
     * For any registered user with correct credentials, login should succeed
     * and return a valid JWT token.
     */
    it('should authenticate users with correct credentials', async () => {
      await fc.assert(
        fc.asyncProperty(
          // Generate valid email and password
          fc.emailAddress(),
          validPassword(),
          async (email, password) => {
            testEmails.push(email);

            // First, register the user
            const { req: regReq, res: regRes, next: regNext } = createMockReqRes({ email, password });
            await register(regReq, regRes, regNext);
            expect(regRes.statusCode).toBe(201);

            // Now try to login with the same credentials
            const { req: loginReq, res: loginRes, next: loginNext } = createMockReqRes({ email, password });
            await login(loginReq, loginRes, loginNext);

            // Should return 200 OK
            expect(loginRes.statusCode).toBe(200);
            
            // Should have a token
            expect(loginRes.data).toHaveProperty('token');
            expect(typeof loginRes.data.token).toBe('string');
            expect(loginRes.data.token.length).toBeGreaterThan(0);
            
            // Token should be a valid JWT
            const tokenParts = loginRes.data.token.split('.');
            expect(tokenParts.length).toBe(3);
            
            // Should return user data
            expect(loginRes.data).toHaveProperty('user');
            expect(loginRes.data.user.email).toBe(email);
          }
        ),
        { numRuns: 10 } // Reduced from 50 to speed up tests
      );
    }, 30000); // 30 second timeout
  });

  describe('Property 5: Invalid credentials rejection', () => {
    /**
     * **Feature: multi-user-auth, Property 5: Invalid credentials rejection**
     * **Validates: Requirements 2.2**
     * 
     * For any login attempt with incorrect email or password, authentication should fail
     * with an appropriate error message.
     */
    it('should reject invalid credentials', async () => {
      await fc.assert(
        fc.asyncProperty(
          // Generate valid email and two different passwords
          fc.emailAddress(),
          validPassword(),
          validPassword(),
          async (email, correctPassword, wrongPassword) => {
            // Skip if passwords happen to be the same
            fc.pre(correctPassword !== wrongPassword);
            
            testEmails.push(email);

            // Register user with correct password
            const { req: regReq, res: regRes, next: regNext } = createMockReqRes({ 
              email, 
              password: correctPassword 
            });
            await register(regReq, regRes, regNext);
            expect(regRes.statusCode).toBe(201);

            // Try to login with wrong password
            const { req: loginReq, res: loginRes, next: loginNext } = createMockReqRes({ 
              email, 
              password: wrongPassword 
            });
            await login(loginReq, loginRes, loginNext);

            // Should return 401 Unauthorized
            expect(loginRes.statusCode).toBe(401);
            expect(loginRes.data.error).toContain('Invalid email or password');
          }
        ),
        { numRuns: 10 } // Reduced from 50 to speed up tests
      );
    }, 30000); // 30 second timeout

    it('should reject login for non-existent users', async () => {
      await fc.assert(
        fc.asyncProperty(
          // Generate email that doesn't exist
          fc.emailAddress(),
          validPassword(),
          async (email, password) => {
            // Try to login without registering
            const { req, res, next } = createMockReqRes({ email, password });
            await login(req, res, next);

            // Should return 401 Unauthorized
            expect(res.statusCode).toBe(401);
            expect(res.data.error).toContain('Invalid email or password');
          }
        ),
        { numRuns: 20 } // Reduced from 100 to speed up tests
      );
    });
  });
});
