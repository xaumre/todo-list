import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as fc from 'fast-check';
import { AuthService } from '../authService.js';

describe('AuthService', () => {
  let authService;

  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    authService = new AuthService();
    // Clear any fetch mocks
    vi.restoreAllMocks();
  });

  describe('Property-Based Tests', () => {
    /**
     * Feature: multi-user-auth, Property 8: Logout clears session
     * Validates: Requirements 3.1, 3.2
     * 
     * For any authenticated user, logging out should clear the session token 
     * and prevent subsequent authenticated requests until re-login.
     */
    it('Property 8: Logout clears session', () => {
      // Generator for valid tokens (JWT-like strings)
      const tokenGenerator = fc.string({ minLength: 20, maxLength: 200 });
      
      // Generator for user objects
      const userGenerator = fc.record({
        id: fc.uuid(),
        email: fc.emailAddress(),
        createdAt: fc.date().map(d => d.toISOString()),
      });

      fc.assert(
        fc.property(tokenGenerator, userGenerator, (token, user) => {
          // Set up authenticated state
          authService.setToken(token);
          authService.setUser(user);

          // Verify user is authenticated before logout
          expect(authService.isAuthenticated()).toBe(true);
          expect(authService.getToken()).toBe(token);
          expect(authService.getCurrentUser()).toEqual(user);

          // Perform logout
          authService.logout();

          // Verify session is cleared
          expect(authService.getToken()).toBeNull();
          expect(authService.getCurrentUser()).toBeNull();
          expect(authService.isAuthenticated()).toBe(false);
        }),
        { numRuns: 100 }
      );
    });

    /**
     * Feature: multi-user-auth, Property 9: Token persistence across refresh
     * Validates: Requirements 6.1, 6.2, 6.4
     * 
     * For any valid session token, refreshing the page should maintain 
     * authentication and restore the user's task list.
     */
    it('Property 9: Token persistence across refresh', () => {
      // Generator for valid tokens (JWT-like strings)
      const tokenGenerator = fc.string({ minLength: 20, maxLength: 200 });
      
      // Generator for user objects
      const userGenerator = fc.record({
        id: fc.uuid(),
        email: fc.emailAddress(),
        createdAt: fc.date().map(d => d.toISOString()),
      });

      fc.assert(
        fc.property(tokenGenerator, userGenerator, (token, user) => {
          // Set up authenticated state
          authService.setToken(token);
          authService.setUser(user);

          // Verify initial state
          expect(authService.isAuthenticated()).toBe(true);
          expect(authService.getToken()).toBe(token);
          expect(authService.getCurrentUser()).toEqual(user);

          // Simulate page refresh by creating a new AuthService instance
          // This simulates the application reloading and re-initializing
          const newAuthService = new AuthService();

          // Verify authentication state is maintained after "refresh"
          expect(newAuthService.isAuthenticated()).toBe(true);
          expect(newAuthService.getToken()).toBe(token);
          
          // Verify user data is restored
          const restoredUser = newAuthService.getCurrentUser();
          expect(restoredUser).not.toBeNull();
          expect(restoredUser.id).toBe(user.id);
          expect(restoredUser.email).toBe(user.email);
          expect(restoredUser.createdAt).toBe(user.createdAt);
        }),
        { numRuns: 100 }
      );
    });
  });
});
